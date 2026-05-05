import bcrypt from "bcryptjs";
import APIFeatures from "../../../utils/apiFeatures.js";
import AppError from "../../../utils/AppError.js";
import User from "../../../model/user.model.js";
import Staff from "../../../model/staff.model.js";
import Role from "../../../model/role.model.js";
import Attendance from "../../../model/attendance.model.js";
import Deduction from "../../../model/deduction.model.js";
import withTransaction from "../../../middleware/transaction.js";
import { createAuditLog } from "../../../common/audit/audit.service.js";
import { salaryQueue } from "../../../common/queues.js";
import { calculateMonthlySalary } from "../salary/salary.service.js";
import { cleanupStoredFile } from "../../../utils/fileCleanup.js";
import { persistUploadedFile } from "../../../utils/uploadedFile.js";

const generateEmployeeCode = async (session) => {
  const total = await Staff.countDocuments({}, { session });
  return `EMP-${String(total + 1).padStart(5, "0")}`;
};

export const createStaff = async (payload, req) =>
  withTransaction(async (session) => {
    const existingUser = await User.findOne({
      email: payload.email.toLowerCase(),
    })
      .setOptions({ includeDeleted: true })
      .session(session);

    if (existingUser) {
      throw new AppError("Email already registered", 409);
    }

    const role = await Role.findOneAndUpdate(
      { name: "staff" },
      {
        $setOnInsert: {
          name: "staff",
          description: "Staff member",
          isSystem: true,
          permissions: ["attendance:write", "leave:create", "leave:read"],
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
        session,
      },
    );

    const password = await bcrypt.hash("Welcome123", 12);
    const [user] = await User.create(
      [
        {
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          password,
          role: role._id,
          permissions: role.permissions || [],
        },
      ],
      { session },
    );

    const [staff] = await Staff.create(
      [
        {
          user: user._id,
          employeeCode: await generateEmployeeCode(session),
          dailySalary: payload.dailySalary,
          joinDate: payload.joinDate ? new Date(payload.joinDate) : new Date(),
          department: payload.department || null,
          position: payload.position,
        },
      ],
      { session },
    );

    await createAuditLog({
      user: req.user._id,
      action: "staff.create",
      resource: "Staff",
      resourceId: staff._id,
      after: staff.toObject(),
      req,
      session,
    });

    return Staff.findById(staff._id).session(session).populate("user department");
  });

export const listStaff = async (queryString) => {
  const totalDocuments = await Staff.countDocuments();
  const features = new APIFeatures(
    Staff.find().populate("user department"),
    queryString,
  )
    .filter(["employeeCode"])
    .sort("-createdAt")
    .paginate(totalDocuments);

  return { results: await features.query, pagination: features.pagination };
};

export const getStaff = async (id) => {
  const staff = await Staff.findById(id).populate("user department");
  if (!staff) throw new AppError("Staff not found", 404);
  return staff;
};

export const updateStaff = async (id, payload, req) => {
  const before = await Staff.findById(id).lean();

  const staff = await Staff.findByIdAndUpdate(
    id,
    {
      ...payload,
      department: payload.department || null,
      joinDate: payload.joinDate ? new Date(payload.joinDate) : undefined,
    },
    { new: true, runValidators: true },
  ).populate("user department");

  if (!staff) throw new AppError("Staff not found", 404);

  await createAuditLog({
    user: req.user._id,
    action: "staff.update",
    resource: "Staff",
    resourceId: staff._id,
    before,
    after: staff.toObject(),
    req,
  });

  return staff;
};

export const softDeleteStaff = async (id, req) =>
  withTransaction(async (session) => {
    const staff = await Staff.findById(id).session(session);
    if (!staff) throw new AppError("Staff not found", 404);

    staff.isDeleted = true;
    staff.deletedAt = new Date();
    await staff.save({ session });

    await Attendance.updateMany(
      { staff: id },
      { isDeleted: true, deletedAt: new Date() },
    ).session(session);

    await Deduction.updateMany(
      { staff: id },
      { isDeleted: true, deletedAt: new Date() },
    ).session(session);

    await createAuditLog({
      user: req.user._id,
      action: "staff.delete",
      resource: "Staff",
      resourceId: staff._id,
      after: { isDeleted: true },
      req,
      session,
    });

    return staff;
  });

export const restoreStaff = async (id, req) => {
  const staff = await Staff.findByIdAndUpdate(
    id,
    { isDeleted: false, deletedAt: null },
    { new: true },
  );

  if (!staff) throw new AppError("Staff not found", 404);

  await createAuditLog({
    user: req.user._id,
    action: "staff.restore",
    resource: "Staff",
    resourceId: staff._id,
    after: { isDeleted: false },
    req,
  });

  return staff;
};

export const getAttendance = async (staffId, queryString) => {
  const totalDocuments = await Attendance.countDocuments({ staff: staffId });
  const features = new APIFeatures(
    Attendance.find({ staff: staffId }),
    queryString,
  )
    .sort("-date")
    .paginate(totalDocuments);

  return { results: await features.query, pagination: features.pagination };
};

export const getMonthlyAttendanceSummary = async (staffId, month) => {
  const [year, monthIndex] = month.split("-").map(Number);

  const start = new Date(Date.UTC(year, monthIndex - 1, 1));
  const end = new Date(Date.UTC(year, monthIndex, 1));

  const records = await Attendance.find({
    staff: staffId,
    date: { $gte: start, $lt: end },
  });

  return {
    totalDays: records.length,
    lateDays: records.filter((r) => r.isLate).length,
    absentDays: records.filter((r) => r.isAbsent).length,
    hoursWorked: records.reduce((sum, r) => sum + (r.workingHours || 0), 0),
  };
};

export const addDeduction = async (staffId, payload, req) => {
  const deduction = await Deduction.create({ ...payload, staff: staffId });

  await createAuditLog({
    user: req.user._id,
    action: "salary.deduction.add",
    resource: "Deduction",
    resourceId: deduction._id,
    after: deduction.toObject(),
    req,
  });

  return deduction;
};

export const listDeductions = async (staffId, queryString) => {
  const totalDocuments = await Deduction.countDocuments({ staff: staffId });
  const features = new APIFeatures(
    Deduction.find({ staff: staffId }),
    queryString,
  )
    .sort("-createdAt")
    .paginate(totalDocuments);

  return { results: await features.query, pagination: features.pagination };
};

export const updateDeduction = async (staffId, deductionId, payload, req) => {
  const before = await Deduction.findOne({
    _id: deductionId,
    staff: staffId,
  }).lean();

  const deduction = await Deduction.findOneAndUpdate(
    { _id: deductionId, staff: staffId },
    payload,
    { new: true, runValidators: true },
  );

  if (!deduction) throw new AppError("Deduction not found", 404);

  await createAuditLog({
    user: req.user._id,
    action: "salary.deduction.update",
    resource: "Deduction",
    resourceId: deduction._id,
    before,
    after: deduction.toObject(),
    req,
  });

  return deduction;
};

export const deleteDeduction = async (staffId, deductionId, req) => {
  const deduction = await Deduction.findOneAndUpdate(
    { _id: deductionId, staff: staffId },
    { isDeleted: true, deletedAt: new Date() },
    { new: true },
  );

  if (!deduction) throw new AppError("Deduction not found", 404);

  await createAuditLog({
    user: req.user._id,
    action: "salary.deduction.delete",
    resource: "Deduction",
    resourceId: deduction._id,
    req,
  });
};

export const calculateSalary = (staffId, month) =>
  calculateMonthlySalary(staffId, month);

export const paySalary = async (staffId, month, req) =>
  withTransaction(async (session) => {
    const result = await calculateMonthlySalary(staffId, month);

    const staff = await Staff.findById(staffId).session(session);
    const existing = staff.monthlyReports.find((r) => r.month === month);

    if (existing && existing.isPaid)
      throw new AppError("Salary already paid for this month", 400);

    if (existing) {
      Object.assign(existing, {
        ...result,
        month,
        isPaid: true,
        paidAt: new Date(),
      });
    } else {
      staff.monthlyReports.push({
        ...result,
        month,
        isPaid: true,
        paidAt: new Date(),
      });
    }

    await staff.save({ session });

    await createAuditLog({
      user: req.user._id,
      action: "salary.pay",
      resource: "Staff",
      resourceId: staff._id,
      after: result,
      req,
      session,
    });

    return result;
  });

export const adjustSalary = async (staffId, month, adjustments, req) => {
  const staff = await Staff.findById(staffId);
  if (!staff) throw new AppError("Staff not found", 404);

  const report = staff.monthlyReports.find((r) => r.month === month);

  if (report) report.adjustments = adjustments;
  else staff.monthlyReports.push({ month, adjustments });

  await staff.save();

  await createAuditLog({
    user: req.user._id,
    action: "salary.adjust",
    resource: "Staff",
    resourceId: staffId,
    after: { month, adjustments },
    req,
  });
};

export const uploadDocument = async (staffId, file, req) => {
  const staff = await Staff.findById(staffId);
  if (!staff) throw new AppError("Staff not found", 404);

  const storedFile = await persistUploadedFile(file, "staff-documents");

  staff.documents.push({
    name: storedFile.name,
    url: storedFile.url,
    publicId: storedFile.publicId,
    path: storedFile.path,
    mimeType: storedFile.mimeType,
  });

  await staff.save();

  await createAuditLog({
    user: req.user._id,
    action: "file.upload",
    resource: "StaffDocument",
    resourceId: staffId,
    after: file.path,
    req,
  });

  return staff.documents[staff.documents.length - 1];
};

export const deleteDocument = async (staffId, docId, req) => {
  const staff = await Staff.findById(staffId);
  if (!staff) throw new AppError("Staff not found", 404);

  const document = staff.documents.id(docId);
  if (!document) throw new AppError("Document not found", 404);

  await cleanupStoredFile(document.toObject());

  document.deleteOne();
  await staff.save();

  await createAuditLog({
    user: req.user._id,
    action: "file.delete",
    resource: "StaffDocument",
    resourceId: staffId,
    req,
  });
};

export const bulkPaySalary = async (month) => {
  const staffMembers = await Staff.find();

  await Promise.all(
    staffMembers.map((staff) =>
      salaryQueue.add({
        staffId: staff._id.toString(),
        month,
      }),
    ),
  );
};

export default {
  createStaff,
  listStaff,
  getStaff,
  updateStaff,
  softDeleteStaff,
  restoreStaff,
  getAttendance,
  getMonthlyAttendanceSummary,
  addDeduction,
  listDeductions,
  updateDeduction,
  deleteDeduction,
  calculateSalary,
  paySalary,
  adjustSalary,
  uploadDocument,
  deleteDocument,
  bulkPaySalary,
};

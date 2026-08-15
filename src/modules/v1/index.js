import express from "express";

import authRouter from "./auth/auth.routes.js";
import userRouter from "./users/users.routes.js";
import leaveRouter from "./leave/leave.routes.js";
import attendanceRouter from "./attendance/attendance.routes.js";
import ticketRouter from "./tickets/tickets.routes.js";
import adminRouter from "./admin.routes.js";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/users", userRouter);
// router.use('/staff', attendanceRouter);
router.use("/attendance", attendanceRouter);
router.use("/leaves", leaveRouter);
router.use("/tickets", ticketRouter);
router.use("/admin", adminRouter);

export default router;

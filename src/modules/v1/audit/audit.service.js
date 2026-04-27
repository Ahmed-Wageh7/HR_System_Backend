import APIFeatures from '../../../utils/apiFeatures.js';
import AuditLog from '../../../model/auditLog.model.js';

export const listLogs = async (queryString, extraFilter = {}) => {
  const totalDocuments = await AuditLog.countDocuments(extraFilter);
  const features = new APIFeatures(AuditLog.find(extraFilter).populate('user'), queryString)
    .sort('-createdAt')
    .paginate(totalDocuments);
  return { results: await features.query, pagination: features.pagination };
};

export default {
  listLogs
};

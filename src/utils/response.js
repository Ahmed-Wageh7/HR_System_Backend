export const sendSuccess = (res, statusCode, data, pagination) => {
  const payload = { status: 'success', data };
  if (pagination) payload.pagination = pagination;
  return res.status(statusCode).json(payload);
};

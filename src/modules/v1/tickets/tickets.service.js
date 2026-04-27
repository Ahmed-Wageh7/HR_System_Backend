import APIFeatures from '../../../utils/apiFeatures.js';
import AppError from '../../../utils/AppError.js';
import Ticket from '../../../model/ticket.model.js';

export const createTicket = async (userId, payload) => Ticket.create({ user: userId, ...payload });

export const listMyTickets = async (userId, queryString) => {
  const totalDocuments = await Ticket.countDocuments({ user: userId });
  const features = new APIFeatures(Ticket.find({ user: userId }), queryString).sort('-createdAt').paginate(totalDocuments);
  return { results: await features.query, pagination: features.pagination };
};

export const getTicket = async (userId, ticketId) => {
  const ticket = await Ticket.findOne({ _id: ticketId, user: userId });
  if (!ticket) throw new AppError('Ticket not found', 404);
  return ticket;
};

export const replyTicket = async (ticketId, userId, message) => {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) throw new AppError('Ticket not found', 404);
  ticket.replies.push({ user: userId, message });
  await ticket.save();
  return ticket;
};

export const updateStatus = async (ticketId, status) => {
  const ticket = await Ticket.findByIdAndUpdate(ticketId, { status }, { new: true });
  if (!ticket) throw new AppError('Ticket not found', 404);
  return ticket;
};

export default {
  createTicket,
  listMyTickets,
  getTicket,
  replyTicket,
  updateStatus
};

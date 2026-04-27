import mongoose from 'mongoose';
import baseFields from './plugins/baseFields.js';

const replySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String
  },
  { timestamps: true }
);

const ticketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    subject: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open'
    },
    replies: [replySchema]
  },
  { timestamps: true }
);

baseFields(ticketSchema);

export default mongoose.model('Ticket', ticketSchema);

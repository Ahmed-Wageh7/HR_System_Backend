import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import env from '../../../../config/env.service.js';
import Message from '../../../model/message.model.js';

let ioInstance;

const connectedAdmins = new Set();

export const initSocket = (server) => {
  ioInstance = new Server(server, {
    cors: {
      origin: env.clientUrl,
      credentials: true
    }
  });

  ioInstance.on('connection', (socket) => {
    socket.on('authenticate', async (token) => {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || env.jwt?.secret || env.jwtSecret);
        socket.data.user = decoded;
        if (decoded.role === 'admin') connectedAdmins.add(socket.id);
      } catch (error) {
        socket.emit('error', 'Authentication failed');
      }
    });

    socket.on('admin:send-message', async (payload) => {
      await Message.create({
        ...payload,
        createdBy: socket.data.user?.sub
      });
      ioInstance.emit('user:receive-message', payload);
    });

    socket.on('disconnect', () => {
      connectedAdmins.delete(socket.id);
    });
  });
};

export const emitToAdmins = (event, payload) => {
  if (!ioInstance) return;
  connectedAdmins.forEach((socketId) => {
    ioInstance.to(socketId).emit(event, payload);
  });
};

export default { initSocket, emitToAdmins };

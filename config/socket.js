import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

const userSocketId = {};

const getUserSocketId = (userId) => {
  return userSocketId[userId] || null;
};

io.on("connection", (socket) => {
  console.log(`✅ Socket connected: ${socket.id}`);

  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketId[userId] = socket.id;
    console.log(`🔗 User ID "${userId}" mapped to socket "${socket.id}"`);
  }

  

  socket.on("disconnect", () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);

    for (const [uid, sid] of Object.entries(userSocketId)) {
      if (sid === socket.id) {
        delete userSocketId[uid];
        break;
      }
    }
  });
});

export { userSocketId, getUserSocketId, io, server, app };

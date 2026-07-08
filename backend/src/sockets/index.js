import { Server } from "socket.io";
import registerHandlers from "./handlers/index.js";

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`✅ Socket connected: ${socket.id}`);

    // Register all event handlers
    registerHandlers(io, socket);

    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export default initializeSocket;
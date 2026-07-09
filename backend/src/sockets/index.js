import { Server } from "socket.io";
import { socketAuthMiddleware } from "./middleware/auth.socket.js";
import registerHandlers from "./handlers/index.js";

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    // Increase timeout for stable connections
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Apply authentication middleware to all connections
  io.use(socketAuthMiddleware);

  // Handle new connections
  io.on("connection", (socket) => {
    console.log(
      `✅ Socket connected: ${socket.id} (User: ${socket.user.email})`
    );

    // Register all event handlers
    registerHandlers(io, socket);

    // Log disconnect
    socket.on("disconnect", (reason) => {
      console.log(
        `❌ Socket disconnected: ${socket.id} (${socket.user?.email}) - Reason: ${reason}`
      );
    });
  });

  console.log("🔌 Socket.io initialized with authentication");
  return io;
};

export default initializeSocket;
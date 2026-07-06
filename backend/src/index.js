import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Test route
app.get("/", (req, res) => {
  res.json({ 
    message: "🚀 CollabAI Backend is running!",
    status: "healthy" 
  });
});

// Socket.io connection
io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// Start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🔥 Backend running on http://localhost:${PORT}`);
  });
});
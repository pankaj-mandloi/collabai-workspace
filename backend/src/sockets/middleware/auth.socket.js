import { verifyToken } from "@clerk/express";
import User from "../../models/user.model.js";

/**
 * Socket.io authentication middleware
 * Verifies Clerk JWT token and attaches user to socket
 */
export const socketAuthMiddleware = async (socket, next) => {
  try {
    // Get token from handshake auth
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    // Verify token with Clerk
    const verifiedToken = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    if (!verifiedToken || !verifiedToken.sub) {
      return next(new Error("Invalid token"));
    }

    const clerkUserId = verifiedToken.sub;

    // Find user in MongoDB
    const user = await User.findOne({ clerkId: clerkUserId });

    if (!user) {
      return next(new Error("User not found"));
    }

    // Attach user to socket
    socket.user = user;
    socket.userId = user._id.toString();
    socket.clerkUserId = clerkUserId;

    console.log(`🔐 Socket authenticated: ${user.email}`);
    next();
  } catch (error) {
    console.error("❌ Socket auth error:", error.message);
    next(new Error("Authentication failed"));
  }
};
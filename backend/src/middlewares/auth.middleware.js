import { getAuth } from "@clerk/express";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// Protect routes (require authentication)
export const protect = asyncHandler(async (req, res, next) => {
  const { userId } = getAuth(req);
  
  console.log("🔍 Auth check - userId:", userId);
  
  if (!userId) {
    throw new ApiError(401, "Unauthorized - Please sign in");
  }

  // Fetch user from MongoDB
  const user = await User.findOne({ clerkId: userId });
  if (!user) {
    throw new ApiError(404, "User not found in database");
  }

  // Attach user to request
  req.user = user;
  req.clerkUserId = userId;

  next();
});

// Optional auth (attach user if logged in, don't fail if not)
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const { userId } = getAuth(req);
  if (userId) {
    const user = await User.findOne({ clerkId: userId });
    if (user) {
      req.user = user;
      req.clerkUserId = userId;
    }
  }
  next();
});
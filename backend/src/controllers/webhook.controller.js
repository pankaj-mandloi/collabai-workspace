import { Webhook } from "svix";
import userService from "../services/user.service.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

class WebhookController {
  clerkWebhook = asyncHandler(async (req, res) => {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      throw new ApiError(500, "CLERK_WEBHOOK_SECRET not configured");
    }

    const svix_id = req.headers["svix-id"];
    const svix_timestamp = req.headers["svix-timestamp"];
    const svix_signature = req.headers["svix-signature"];

    if (!svix_id || !svix_timestamp || !svix_signature) {
      throw new ApiError(400, "Missing required svix headers");
    }

    const payload = req.body.toString();

    const wh = new Webhook(WEBHOOK_SECRET);
    let evt;

    try {
      evt = wh.verify(payload, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err.message);
      throw new ApiError(400, "Webhook signature verification failed");
    }

    const eventType = evt.type;
    const data = evt.data;

    console.log(`📨 Webhook received: ${eventType}`);

    switch (eventType) {
      case "user.created":
        await userService.createUser(data);
        break;

      case "user.updated":
        await userService.updateUser(data);
        break;

      case "user.deleted":
        await userService.deleteUser(data.id);
        break;

      default:
        console.log(`⚠️ Unhandled webhook event: ${eventType}`);
    }

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Webhook processed successfully"));
  });
}

export default new WebhookController();
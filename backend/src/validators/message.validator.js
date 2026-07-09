import { z } from "zod";

// Reusable MongoDB ObjectId validator
const mongoIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ID format");

// ============================================
// MESSAGE VALIDATORS
// ============================================

// Send message validator
export const sendMessageSchema = z.object({
  body: z.object({
    content: z
      .string({ required_error: "Message content is required" })
      .trim()
      .min(1, "Message cannot be empty")
      .max(5000, "Message must not exceed 5000 characters"),

    workspaceId: mongoIdSchema,

    replyTo: mongoIdSchema.optional(),

    attachments: z
      .array(
        z.object({
          type: z.enum(["image", "file", "video", "audio"]),
          url: z.string().url("Invalid attachment URL"),
          name: z.string().min(1, "Attachment name required"),
          size: z.number().optional(),
        })
      )
      .optional(),
  }),
});

// Get workspace messages validator
export const getWorkspaceMessagesSchema = z.object({
  params: z.object({
    workspaceId: mongoIdSchema,
  }),
  query: z.object({
    page: z
      .string()
      .regex(/^\d+$/, "Page must be a number")
      .optional(),
    limit: z
      .string()
      .regex(/^\d+$/, "Limit must be a number")
      .optional(),
    before: z
      .string()
      .datetime({ message: "Invalid date format" })
      .optional(),
  }),
});

// Get message by ID validator
export const messageIdSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
});

// Edit message validator
export const editMessageSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
  body: z.object({
    content: z
      .string({ required_error: "Message content is required" })
      .trim()
      .min(1, "Message cannot be empty")
      .max(5000, "Message must not exceed 5000 characters"),
  }),
});

// Add reaction validator
export const addReactionSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
  body: z.object({
    emoji: z
      .string({ required_error: "Emoji is required" })
      .min(1, "Emoji cannot be empty")
      .max(10, "Invalid emoji"),
  }),
});

// Get message count validator
export const messageCountSchema = z.object({
  params: z.object({
    workspaceId: mongoIdSchema,
  }),
});
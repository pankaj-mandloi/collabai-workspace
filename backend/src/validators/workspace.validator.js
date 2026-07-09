import { z } from "zod";

// Reusable MongoDB ObjectId validator
const mongoIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ID format");

// Reusable email validator
const emailSchema = z
  .string()
  .email("Invalid email format")
  .toLowerCase()
  .trim();

// ============================================
// WORKSPACE VALIDATORS
// ============================================

// Create workspace validator
export const createWorkspaceSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "Workspace name is required" })
      .trim()
      .min(3, "Name must be at least 3 characters")
      .max(50, "Name must not exceed 50 characters"),

    description: z
      .string()
      .trim()
      .max(500, "Description must not exceed 500 characters")
      .optional(),
  }),
});

// Update workspace validator
export const updateWorkspaceSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(3, "Name must be at least 3 characters")
        .max(50, "Name must not exceed 50 characters")
        .optional(),

      description: z
        .string()
        .trim()
        .max(500, "Description must not exceed 500 characters")
        .optional(),

      avatar: z.string().url("Avatar must be a valid URL").optional(),

      settings: z
        .object({
          allowMemberInvites: z.boolean().optional(),
          isPublic: z.boolean().optional(),
        })
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    }),
});

// Get/Delete workspace by ID validator
export const workspaceIdSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
});

// ============================================
// INVITATION VALIDATORS
// ============================================

// Invite member validator
export const inviteMemberSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
  body: z.object({
    email: emailSchema,
    role: z.enum(["admin", "member"]).optional().default("member"),
  }),
});

// Accept invitation validator
export const acceptInvitationSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
    invitationId: mongoIdSchema,
  }),
});

// ============================================
// MEMBER MANAGEMENT VALIDATORS
// ============================================

// Remove member validator
export const removeMemberSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
    memberId: mongoIdSchema,
  }),
});

// Update member role validator
export const updateMemberRoleSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
    memberId: mongoIdSchema,
  }),
  body: z.object({
    role: z.enum(["admin", "member"], {
      required_error: "Role is required",
      invalid_type_error: "Role must be 'admin' or 'member'",
    }),
  }),
});
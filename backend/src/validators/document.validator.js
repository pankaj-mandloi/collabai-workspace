import { z } from "zod";

const mongoIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ID format");

// Create document
export const createDocumentSchema = z.object({
  body: z.object({
    title: z.string().trim().max(200, "Title too long").optional(),
    content: z.string().max(1000000, "Content too large").optional(),
    workspaceId: mongoIdSchema,
    icon: z.string().max(10).optional(),
    parent: mongoIdSchema.optional().nullable(),
  }),
});

// Update document
export const updateDocumentSchema = z.object({
  params: z.object({ id: mongoIdSchema }),
  body: z
    .object({
      title: z.string().trim().max(200).optional(),
      content: z.string().max(1000000).optional(),
      icon: z.string().max(10).optional(),
      coverImage: z.string().url().optional().or(z.literal("")),
      isPublic: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field required",
    }),
});

// Document ID validator
export const documentIdSchema = z.object({
  params: z.object({ id: mongoIdSchema }),
});

// Workspace documents
export const workspaceDocumentsSchema = z.object({
  params: z.object({ workspaceId: mongoIdSchema }),
});
import { z } from "zod";

const mongoIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ID format");

// Create task
export const createTaskSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: "Task title is required" })
      .trim()
      .min(1, "Title cannot be empty")
      .max(200, "Title too long (max 200)"),
    description: z.string().trim().max(2000).optional(),
    workspaceId: mongoIdSchema,
    status: z.enum(["todo", "in_progress", "done"]).optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    assignees: z.array(mongoIdSchema).optional(),
    dueDate: z.string().datetime().optional().nullable(),
    labels: z
      .array(
        z.object({
          name: z.string().min(1).max(30),
          color: z.string().optional(),
        })
      )
      .optional(),
  }),
});

// Update task
export const updateTaskSchema = z.object({
  params: z.object({ id: mongoIdSchema }),
  body: z
    .object({
      title: z.string().trim().min(1).max(200).optional(),
      description: z.string().trim().max(2000).optional(),
      status: z.enum(["todo", "in_progress", "done"]).optional(),
      priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
      assignees: z.array(mongoIdSchema).optional(),
      dueDate: z.string().datetime().optional().nullable(),
      startDate: z.string().datetime().optional().nullable(),
      labels: z
        .array(
          z.object({
            name: z.string().min(1).max(30),
            color: z.string().optional(),
          })
        )
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field required",
    }),
});

// Move task
export const moveTaskSchema = z.object({
  params: z.object({ id: mongoIdSchema }),
  body: z.object({
    status: z.enum(["todo", "in_progress", "done"]).optional(),
    position: z.number().optional(),
  }),
});

// Task ID validator
export const taskIdSchema = z.object({
  params: z.object({ id: mongoIdSchema }),
});

// Workspace tasks
export const workspaceTasksSchema = z.object({
  params: z.object({ workspaceId: mongoIdSchema }),
});

// Add checklist
export const addChecklistSchema = z.object({
  params: z.object({ id: mongoIdSchema }),
  body: z.object({
    text: z
      .string({ required_error: "Text is required" })
      .trim()
      .min(1, "Text cannot be empty")
      .max(200, "Text too long"),
  }),
});

// Toggle checklist
export const toggleChecklistSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
    itemId: mongoIdSchema,
  }),
});
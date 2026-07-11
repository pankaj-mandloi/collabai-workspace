import { Router } from "express";
import taskController from "../controllers/task.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  createTaskSchema,
  updateTaskSchema,
  moveTaskSchema,
  taskIdSchema,
  workspaceTasksSchema,
  addChecklistSchema,
  toggleChecklistSchema,
} from "../validators/task.validator.js";

const router = Router();

router.use(protect);

// User's tasks (specific route BEFORE :id routes)
router.get("/my-tasks", taskController.getUserTasks);

// Workspace tasks
router.get(
  "/workspace/:workspaceId",
  validate(workspaceTasksSchema),
  taskController.getWorkspaceTasks
);

// CRUD
router.post("/", validate(createTaskSchema), taskController.createTask);
router.get("/:id", validate(taskIdSchema), taskController.getTaskById);
router.patch("/:id", validate(updateTaskSchema), taskController.updateTask);
router.delete("/:id", validate(taskIdSchema), taskController.deleteTask);

// Move task (drag-drop)
router.patch(
  "/:id/move",
  validate(moveTaskSchema),
  taskController.moveTask
);

// Checklist
router.post(
  "/:id/checklist",
  validate(addChecklistSchema),
  taskController.addChecklistItem
);
router.patch(
  "/:id/checklist/:itemId",
  validate(toggleChecklistSchema),
  taskController.toggleChecklistItem
);

export default router;
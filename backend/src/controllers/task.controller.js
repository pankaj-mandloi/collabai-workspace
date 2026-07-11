import taskService from "../services/task.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

class TaskController {
  /**
   * POST /api/v1/tasks
   */
  createTask = asyncHandler(async (req, res) => {
    const task = await taskService.createTask(req.body, req.user);
    return res
      .status(201)
      .json(new ApiResponse(201, task, "Task created successfully"));
  });

  /**
   * GET /api/v1/tasks/workspace/:workspaceId
   */
  getWorkspaceTasks = asyncHandler(async (req, res) => {
    const { workspaceId } = req.params;
    const result = await taskService.getWorkspaceTasks(
      workspaceId,
      req.user._id
    );
    return res
      .status(200)
      .json(new ApiResponse(200, result, "Tasks fetched successfully"));
  });

  /**
   * GET /api/v1/tasks/:id
   */
  getTaskById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const task = await taskService.getTaskById(id, req.user._id);
    return res
      .status(200)
      .json(new ApiResponse(200, task, "Task fetched successfully"));
  });

  /**
   * PATCH /api/v1/tasks/:id
   */
  updateTask = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const task = await taskService.updateTask(id, req.body, req.user._id);
    return res
      .status(200)
      .json(new ApiResponse(200, task, "Task updated successfully"));
  });

  /**
   * PATCH /api/v1/tasks/:id/move
   */
  moveTask = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const task = await taskService.moveTask(id, req.body, req.user._id);
    return res
      .status(200)
      .json(new ApiResponse(200, task, "Task moved successfully"));
  });

  /**
   * DELETE /api/v1/tasks/:id
   */
  deleteTask = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await taskService.deleteTask(id, req.user._id);
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Task deleted successfully"));
  });

  /**
   * POST /api/v1/tasks/:id/checklist
   */
  addChecklistItem = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { text } = req.body;
    const task = await taskService.addChecklistItem(id, text, req.user._id);
    return res
      .status(200)
      .json(new ApiResponse(200, task, "Checklist item added"));
  });

  /**
   * PATCH /api/v1/tasks/:id/checklist/:itemId
   */
  toggleChecklistItem = asyncHandler(async (req, res) => {
    const { id, itemId } = req.params;
    const task = await taskService.toggleChecklistItem(
      id,
      itemId,
      req.user._id
    );
    return res
      .status(200)
      .json(new ApiResponse(200, task, "Checklist item toggled"));
  });

  /**
   * GET /api/v1/tasks/my-tasks
   */
  getUserTasks = asyncHandler(async (req, res) => {
    const { workspaceId } = req.query;
    const tasks = await taskService.getUserTasks(req.user._id, workspaceId);
    return res
      .status(200)
      .json(new ApiResponse(200, tasks, "User tasks fetched"));
  });
}

export default new TaskController();
import Task from "../models/task.model.js";
import Workspace from "../models/workspace.model.js";
import ApiError from "../utils/ApiError.js";

class TaskService {
  /**
   * Create new task
   */
  async createTask(data, user) {
    try {
      const {
        title,
        description,
        workspaceId,
        status = "todo",
        priority = "medium",
        assignees = [],
        dueDate,
        labels = [],
      } = data;

      if (!title || title.trim().length === 0) {
        throw new ApiError(400, "Task title is required");
      }

      // Verify workspace access
      const workspace = await Workspace.findById(workspaceId);
      if (!workspace) throw new ApiError(404, "Workspace not found");
      if (!workspace.isMember(user._id)) {
        throw new ApiError(403, "You are not a member of this workspace");
      }

      // Get position (last in column)
      const lastTask = await Task.findOne({
        workspace: workspaceId,
        status,
        isDeleted: false,
      })
        .sort({ position: -1 })
        .select("position");

      const position = lastTask ? lastTask.position + 1000 : 1000;

      // Create task
      let task = await Task.create({
        title: title.trim(),
        description: description?.trim() || "",
        status,
        priority,
        assignees,
        createdBy: user._id,
        workspace: workspaceId,
        dueDate: dueDate || null,
        labels,
        position,
      });

      // Populate for response
      task = await Task.findById(task._id)
        .populate("assignees", "firstName lastName email avatar")
        .populate("createdBy", "firstName lastName email avatar");

      console.log(`✅ Task created: ${task.title}`);
      return task;
    } catch (error) {
      console.error("❌ Error creating task:", error.message);
      throw error;
    }
  }

  /**
   * Get all tasks for workspace (grouped by status)
   */
  async getWorkspaceTasks(workspaceId, userId) {
    try {
      // Verify access
      const workspace = await Workspace.findById(workspaceId);
      if (!workspace) throw new ApiError(404, "Workspace not found");
      if (!workspace.isMember(userId)) {
        throw new ApiError(403, "You are not a member of this workspace");
      }

      const tasks = await Task.find({
        workspace: workspaceId,
        isDeleted: false,
      })
        .sort({ status: 1, position: 1 })
        .populate("assignees", "firstName lastName email avatar")
        .populate("createdBy", "firstName lastName email avatar");

      // Group by status
      const grouped = {
        todo: tasks.filter((t) => t.status === "todo"),
        in_progress: tasks.filter((t) => t.status === "in_progress"),
        done: tasks.filter((t) => t.status === "done"),
      };

      return {
        tasks,
        grouped,
        total: tasks.length,
      };
    } catch (error) {
      console.error("❌ Error fetching tasks:", error.message);
      throw error;
    }
  }

  /**
   * Get single task
   */
  async getTaskById(taskId, userId) {
    try {
      const task = await Task.findById(taskId)
        .populate("assignees", "firstName lastName email avatar")
        .populate("createdBy", "firstName lastName email avatar")
        .populate("comments.author", "firstName lastName email avatar");

      if (!task || task.isDeleted) throw new ApiError(404, "Task not found");

      // Verify workspace access
      const workspace = await Workspace.findById(task.workspace);
      if (!workspace.isMember(userId)) {
        throw new ApiError(403, "Access denied");
      }

      return task;
    } catch (error) {
      console.error("❌ Error fetching task:", error.message);
      throw error;
    }
  }

  /**
   * Update task
   */
  async updateTask(taskId, data, userId) {
    try {
      const task = await Task.findById(taskId);
      if (!task || task.isDeleted) throw new ApiError(404, "Task not found");

      // Verify workspace access
      const workspace = await Workspace.findById(task.workspace);
      if (!workspace.isMember(userId)) {
        throw new ApiError(403, "Access denied");
      }

      // Update allowed fields
      const allowedFields = [
        "title",
        "description",
        "status",
        "priority",
        "assignees",
        "dueDate",
        "startDate",
        "labels",
      ];

      allowedFields.forEach((field) => {
        if (data[field] !== undefined) {
          task[field] = data[field];
        }
      });

      await task.save();

      // Populate for response
      const updated = await Task.findById(taskId)
        .populate("assignees", "firstName lastName email avatar")
        .populate("createdBy", "firstName lastName email avatar");

      console.log(`✅ Task updated: ${updated.title}`);
      return updated;
    } catch (error) {
      console.error("❌ Error updating task:", error.message);
      throw error;
    }
  }

  /**
   * Move task (drag-drop between columns or reorder)
   */
  async moveTask(taskId, data, userId) {
    try {
      const { status, position } = data;

      const task = await Task.findById(taskId);
      if (!task || task.isDeleted) throw new ApiError(404, "Task not found");

      const workspace = await Workspace.findById(task.workspace);
      if (!workspace.isMember(userId)) {
        throw new ApiError(403, "Access denied");
      }

      if (status) task.status = status;
      if (position !== undefined) task.position = position;

      await task.save();

      const updated = await Task.findById(taskId)
        .populate("assignees", "firstName lastName email avatar")
        .populate("createdBy", "firstName lastName email avatar");

      console.log(`✅ Task moved: ${updated.title} → ${updated.status}`);
      return updated;
    } catch (error) {
      console.error("❌ Error moving task:", error.message);
      throw error;
    }
  }

  /**
   * Delete task (soft delete)
   */
  async deleteTask(taskId, userId) {
    try {
      const task = await Task.findById(taskId);
      if (!task || task.isDeleted) throw new ApiError(404, "Task not found");

      const workspace = await Workspace.findById(task.workspace);
      if (!workspace.isMember(userId)) {
        throw new ApiError(403, "Access denied");
      }

      // Only creator or workspace admin/owner can delete
      const creatorId = task.createdBy.toString();
      const canDelete =
        creatorId === userId.toString() || workspace.canManage(userId);

      if (!canDelete) {
        throw new ApiError(403, "Only creator or workspace admin can delete");
      }

      task.isDeleted = true;
      task.deletedAt = new Date();
      await task.save();

      console.log(`✅ Task deleted: ${task.title}`);
      return task;
    } catch (error) {
      console.error("❌ Error deleting task:", error.message);
      throw error;
    }
  }

  /**
   * Add checklist item
   */
  async addChecklistItem(taskId, text, userId) {
    try {
      const task = await Task.findById(taskId);
      if (!task || task.isDeleted) throw new ApiError(404, "Task not found");

      const workspace = await Workspace.findById(task.workspace);
      if (!workspace.isMember(userId)) {
        throw new ApiError(403, "Access denied");
      }

      task.checklist.push({ text: text.trim(), isCompleted: false });
      await task.save();

      return task;
    } catch (error) {
      console.error("❌ Error adding checklist:", error.message);
      throw error;
    }
  }

  /**
   * Toggle checklist item
   */
  async toggleChecklistItem(taskId, itemId, userId) {
    try {
      const task = await Task.findById(taskId);
      if (!task || task.isDeleted) throw new ApiError(404, "Task not found");

      const workspace = await Workspace.findById(task.workspace);
      if (!workspace.isMember(userId)) {
        throw new ApiError(403, "Access denied");
      }

      const item = task.checklist.id(itemId);
      if (!item) throw new ApiError(404, "Checklist item not found");

      item.isCompleted = !item.isCompleted;
      item.completedBy = item.isCompleted ? userId : null;
      item.completedAt = item.isCompleted ? new Date() : null;

      await task.save();
      return task;
    } catch (error) {
      console.error("❌ Error toggling checklist:", error.message);
      throw error;
    }
  }

  /**
   * Get user's tasks across all workspaces
   */
  async getUserTasks(userId, workspaceId = null) {
    try {
      const query = {
        assignees: userId,
        isDeleted: false,
      };

      if (workspaceId) query.workspace = workspaceId;

      const tasks = await Task.find(query)
        .sort({ dueDate: 1, priority: -1 })
        .populate("workspace", "name slug")
        .populate("assignees", "firstName lastName email avatar")
        .populate("createdBy", "firstName lastName email avatar");

      return tasks;
    } catch (error) {
      console.error("❌ Error fetching user tasks:", error.message);
      throw error;
    }
  }
}

export default new TaskService();
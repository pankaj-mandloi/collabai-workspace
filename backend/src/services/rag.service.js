import Message from "../models/message.model.js";
import Document from "../models/document.model.js";
import Task from "../models/task.model.js";
import { getEmbeddingService } from "./embedding.service.js";

class RAGService {
  constructor() {
    this.embeddingService = getEmbeddingService();
  }

  // Embed a message
  async embedMessage(messageId) {
    try {
      const message = await Message.findById(messageId).select("+embedding");
      if (!message) return null;

      const text = this.embeddingService.prepareText(message.content);
      const embedding = await this.embeddingService.generateEmbedding(text);

      if (embedding) {
        message.embedding = embedding;
        message.embeddingGeneratedAt = new Date();
        await message.save();
      }

      return embedding;
    } catch (error) {
      console.error("❌ Embed message error:", error.message);
      return null;
    }
  }

  // Embed a document
  async embedDocument(documentId) {
    try {
      const doc = await Document.findById(documentId).select("+embedding");
      if (!doc) return null;

      const text = this.embeddingService.prepareText(
        `${doc.title}\n\n${doc.content}`,
        "document"
      );
      const embedding = await this.embeddingService.generateEmbedding(text);

      if (embedding) {
        doc.embedding = embedding;
        doc.embeddingGeneratedAt = new Date();
        await doc.save();
      }

      return embedding;
    } catch (error) {
      console.error("❌ Embed document error:", error.message);
      return null;
    }
  }

  // Vector search messages (semantic)
  async searchMessages(workspaceId, query, limit = 5) {
    try {
      const queryEmbedding =
        await this.embeddingService.generateEmbedding(query);

      if (!queryEmbedding) return [];

      const results = await Message.aggregate([
        {
          $vectorSearch: {
            index: "vector_index",
            path: "embedding",
            queryVector: queryEmbedding,
            numCandidates: 100,
            limit: limit,
            filter: {
              workspace: workspaceId,
              isDeleted: false,
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "sender",
            foreignField: "_id",
            as: "sender",
          },
        },
        { $unwind: "$sender" },
        {
          $project: {
            content: 1,
            sender: {
              firstName: "$sender.firstName",
              email: "$sender.email",
            },
            createdAt: 1,
            score: { $meta: "vectorSearchScore" },
          },
        },
      ]);

      return results;
    } catch (error) {
      console.error("❌ Search messages error:", error.message);
      return [];
    }
  }

  // Vector search documents (semantic)
  async searchDocuments(workspaceId, query, limit = 3) {
    try {
      const queryEmbedding =
        await this.embeddingService.generateEmbedding(query);

      if (!queryEmbedding) return [];

      const results = await Document.aggregate([
        {
          $vectorSearch: {
            index: "vector_index",
            path: "embedding",
            queryVector: queryEmbedding,
            numCandidates: 50,
            limit: limit,
            filter: {
              workspace: workspaceId,
              isDeleted: false,
            },
          },
        },
        {
          $project: {
            title: 1,
            content: 1,
            icon: 1,
            createdAt: 1,
            score: { $meta: "vectorSearchScore" },
          },
        },
      ]);

      return results;
    } catch (error) {
      console.error("❌ Search documents error:", error.message);
      return [];
    }
  }

  // Text search tasks (no vector needed)
  async searchTasks(workspaceId, query, limit = 5) {
    try {
      const keywords = query
        .toLowerCase()
        .split(" ")
        .filter((word) => word.length > 2);

      const searchPattern = keywords.length > 0 ? keywords.join("|") : query;

      // Keyword search
      const results = await Task.find({
        workspace: workspaceId,
        isDeleted: false,
        $or: [
          { title: { $regex: searchPattern, $options: "i" } },
          { description: { $regex: searchPattern, $options: "i" } },
        ],
      })
        .select("title description status priority dueDate createdAt")
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      // Also get pending tasks
      const pendingTasks = await Task.find({
        workspace: workspaceId,
        isDeleted: false,
        status: { $in: ["todo", "in_progress"] },
      })
        .select("title description status priority dueDate createdAt")
        .sort({ priority: -1, createdAt: -1 })
        .limit(limit)
        .lean();

      // Merge and deduplicate
      const taskMap = new Map();
      [...results, ...pendingTasks].forEach((task) => {
        taskMap.set(task._id.toString(), task);
      });

      return Array.from(taskMap.values()).slice(0, limit);
    } catch (error) {
      console.error("❌ Search tasks error:", error.message);
      return [];
    }
  }

  // Get complete workspace context
  async getWorkspaceContext(workspaceId, query) {
    try {
      const [messages, documents, tasks] = await Promise.all([
        this.searchMessages(workspaceId, query, 5),
        this.searchDocuments(workspaceId, query, 3),
        this.searchTasks(workspaceId, query, 5),
      ]);

      return {
        messages,
        documents,
        tasks,
        totalResults: messages.length + documents.length + tasks.length,
      };
    } catch (error) {
      console.error("❌ Get context error:", error.message);
      return { messages: [], documents: [], tasks: [], totalResults: 0 };
    }
  }

  // Format context for AI prompt
  formatContextForAI(context) {
    let formatted = "";

    if (context.messages && context.messages.length > 0) {
      formatted += "\n**Recent Chat Messages:**\n";
      context.messages.forEach((msg) => {
        const sender = msg.sender?.firstName || msg.sender?.email || "Unknown";
        formatted += `- ${sender}: ${msg.content}\n`;
      });
    }

    if (context.tasks && context.tasks.length > 0) {
      formatted += "\n**Related Tasks:**\n";
      context.tasks.forEach((task) => {
        formatted += `- [${task.status}] ${task.title} (Priority: ${task.priority})\n`;
        if (task.description) {
          formatted += `  Description: ${task.description.substring(0, 100)}\n`;
        }
      });
    }

    if (context.documents && context.documents.length > 0) {
      formatted += "\n**Related Documents:**\n";
      context.documents.forEach((doc) => {
        const preview = (doc.content || "")
          .replace(/<[^>]*>/g, "")
          .substring(0, 200);
        formatted += `- ${doc.title}: ${preview}...\n`;
      });
    }

    return formatted || "No related workspace data found.";
  }
}

let ragServiceInstance = null;

export const getRAGService = () => {
  if (!ragServiceInstance) {
    ragServiceInstance = new RAGService();
  }
  return ragServiceInstance;
};

export default getRAGService;
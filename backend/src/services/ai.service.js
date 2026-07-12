import { GoogleGenerativeAI } from "@google/generative-ai";
import ApiError from "../utils/ApiError.js";

class AIService {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("❌ GEMINI_API_KEY not found");
      throw new Error("GEMINI_API_KEY is required");
    }

    this.genAI = new GoogleGenerativeAI(apiKey);

    this.model = this.genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });

    console.log("✅ Gemini AI initialized (gemini-2.5-flash)");
  }

  async chat(message, context = null) {
    try {
      if (!message || message.trim().length === 0) {
        throw new ApiError(400, "Message is required");
      }

      let prompt = message;

      if (context) {
        prompt = `Context: ${context}\n\nUser Question: ${message}\n\nProvide a helpful, concise response based on the context.`;
      }

      const result = await this.model.generateContent(prompt);
      const text = result.response.text();

      console.log(`✅ AI responded (${text.length} chars)`);

      return {
        message: text,
        model: "gemini-2.5-flash",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("❌ AI chat error:", error.message);

      if (error.message?.includes("API_KEY")) {
        throw new ApiError(500, "AI service configuration error");
      }
      if (error.message?.includes("quota") || error.message?.includes("rate")) {
        throw new ApiError(429, "AI rate limit exceeded. Please try again.");
      }
      if (error.message?.includes("SAFETY")) {
        throw new ApiError(400, "Message blocked by safety filters.");
      }

      throw new ApiError(500, error.message || "AI service error");
    }
  }

  async chatWithHistory(messages) {
    try {
      if (!messages || messages.length === 0) {
        throw new ApiError(400, "Messages array is required");
      }

      const chat = this.model.startChat({
        history: messages.slice(0, -1).map((msg) => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        })),
      });

      const lastMessage = messages[messages.length - 1];
      const result = await chat.sendMessage(lastMessage.content);
      const text = result.response.text();

      return {
        message: text,
        model: "gemini-2.5-flash",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("❌ AI history error:", error.message);
      throw new ApiError(500, error.message || "AI service error");
    }
  }

  async summarize(text, maxLength = 100) {
    try {
      if (!text || text.trim().length === 0) {
        throw new ApiError(400, "Text is required");
      }

      const prompt = `Summarize the following text in ${maxLength} words or less. Be concise:\n\n${text}`;
      const result = await this.model.generateContent(prompt);

      return {
        summary: result.response.text(),
        originalLength: text.length,
      };
    } catch (error) {
      console.error("❌ AI summarize error:", error.message);
      throw new ApiError(500, "Failed to summarize text");
    }
  }

  async generate(prompt, options = {}) {
    try {
      if (!prompt || prompt.trim().length === 0) {
        throw new ApiError(400, "Prompt is required");
      }

      const result = await this.model.generateContent(prompt);

      return {
        text: result.response.text(),
        model: "gemini-2.5-flash",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("❌ AI generate error:", error.message);
      throw new ApiError(500, "Failed to generate text");
    }
  }

  async chatWithContext(message, workspaceId, userId) {
    try {
      if (!message || message.trim().length === 0) {
        throw new ApiError(400, "Message is required");
      }

      const { getRAGService } = await import("./rag.service.js");
      const ragService = getRAGService();

      const context = await ragService.getWorkspaceContext(
        workspaceId,
        message
      );

      const contextText = ragService.formatContextForAI(context);

      const prompt = `You are an AI assistant for CollabAI, a team collaboration platform.
You have access to the user's workspace data.

**Workspace Context:**
${contextText}

**User Question:** ${message}

Please provide a helpful, specific answer based on the workspace context above.
If the context doesn't have relevant information, say so honestly.
Keep the response concise and useful.`;

      const result = await this.model.generateContent(prompt);
      const text = result.response.text();

      console.log(`✅ AI answered with ${context.totalResults} context items`);

      return {
        message: text,
        contextUsed: {
          messagesCount: context.messages.length,
          documentsCount: context.documents.length,
          tasksCount: context.tasks.length,
        },
        model: "gemini-2.5-flash",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("❌ Contextual chat error:", error.message);
      throw new ApiError(500, error.message || "AI service error");
    }
  }
}

let aiServiceInstance = null;

export const getAIService = () => {
  if (!aiServiceInstance) {
    aiServiceInstance = new AIService();
  }
  return aiServiceInstance;
};

export default getAIService;
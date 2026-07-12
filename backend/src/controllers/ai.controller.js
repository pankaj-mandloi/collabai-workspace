import { getAIService } from "../services/ai.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

class AIController {
  chat = asyncHandler(async (req, res) => {
    const { message, context } = req.body;
    if (!message) throw new ApiError(400, "Message is required");

    const aiService = getAIService();
    const response = await aiService.chat(message, context);

    return res
      .status(200)
      .json(new ApiResponse(200, response, "AI response generated"));
  });

  chatWithHistory = asyncHandler(async (req, res) => {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      throw new ApiError(400, "Messages array is required");
    }

    const aiService = getAIService();
    const response = await aiService.chatWithHistory(messages);

    return res
      .status(200)
      .json(new ApiResponse(200, response, "AI response generated"));
  });

  chatWithWorkspaceContext = asyncHandler(async (req, res) => {
    const { message, workspaceId } = req.body;
    if (!message) throw new ApiError(400, "Message is required");
    if (!workspaceId) throw new ApiError(400, "Workspace ID is required");

    const aiService = getAIService();
    const response = await aiService.chatWithContext(
      message,
      workspaceId,
      req.user._id
    );

    return res
      .status(200)
      .json(new ApiResponse(200, response, "AI response with context"));
  });

  summarize = asyncHandler(async (req, res) => {
    const { text, maxLength } = req.body;
    if (!text) throw new ApiError(400, "Text is required");

    const aiService = getAIService();
    const response = await aiService.summarize(text, maxLength);

    return res
      .status(200)
      .json(new ApiResponse(200, response, "Text summarized"));
  });

  generate = asyncHandler(async (req, res) => {
    const { prompt, options } = req.body;
    if (!prompt) throw new ApiError(400, "Prompt is required");

    const aiService = getAIService();
    const response = await aiService.generate(prompt, options);

    return res
      .status(200)
      .json(new ApiResponse(200, response, "Text generated"));
  });

  status = asyncHandler(async (req, res) => {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          available: !!process.env.GEMINI_API_KEY,
          model: "gemini-2.5-flash",
          provider: "Google Gemini",
        },
        "AI service status"
      )
    );
  });
}

export default new AIController();
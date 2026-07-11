import documentService from "../services/document.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

class DocumentController {
  /**
   * POST /api/v1/documents
   */
  createDocument = asyncHandler(async (req, res) => {
    const document = await documentService.createDocument(req.body, req.user);
    return res
      .status(201)
      .json(new ApiResponse(201, document, "Document created successfully"));
  });

  /**
   * GET /api/v1/documents/workspace/:workspaceId
   */
  getWorkspaceDocuments = asyncHandler(async (req, res) => {
    const { workspaceId } = req.params;
    const documents = await documentService.getWorkspaceDocuments(
      workspaceId,
      req.user._id
    );
    return res
      .status(200)
      .json(new ApiResponse(200, documents, "Documents fetched successfully"));
  });

  /**
   * GET /api/v1/documents/starred
   */
  getStarredDocuments = asyncHandler(async (req, res) => {
    const documents = await documentService.getStarredDocuments(req.user._id);
    return res
      .status(200)
      .json(new ApiResponse(200, documents, "Starred documents fetched"));
  });

  /**
   * GET /api/v1/documents/:id
   */
  getDocumentById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const document = await documentService.getDocumentById(id, req.user._id);
    return res
      .status(200)
      .json(new ApiResponse(200, document, "Document fetched successfully"));
  });

  /**
   * PATCH /api/v1/documents/:id
   */
  updateDocument = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const document = await documentService.updateDocument(
      id,
      req.body,
      req.user._id
    );
    return res
      .status(200)
      .json(new ApiResponse(200, document, "Document updated successfully"));
  });

  /**
   * DELETE /api/v1/documents/:id
   */
  deleteDocument = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await documentService.deleteDocument(id, req.user._id);
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Document deleted successfully"));
  });

  /**
   * POST /api/v1/documents/:id/star
   */
  toggleStar = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const document = await documentService.toggleStar(id, req.user._id);
    return res
      .status(200)
      .json(new ApiResponse(200, document, "Star toggled successfully"));
  });
}

export default new DocumentController();
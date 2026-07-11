import { Router } from "express";
import documentController from "../controllers/document.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  createDocumentSchema,
  updateDocumentSchema,
  documentIdSchema,
  workspaceDocumentsSchema,
} from "../validators/document.validator.js";

const router = Router();

router.use(protect);

// Get starred documents (BEFORE :id routes)
router.get("/starred", documentController.getStarredDocuments);

// Workspace documents
router.get(
  "/workspace/:workspaceId",
  validate(workspaceDocumentsSchema),
  documentController.getWorkspaceDocuments
);

// CRUD
router.post(
  "/",
  validate(createDocumentSchema),
  documentController.createDocument
);

router.get(
  "/:id",
  validate(documentIdSchema),
  documentController.getDocumentById
);

router.patch(
  "/:id",
  validate(updateDocumentSchema),
  documentController.updateDocument
);

router.delete(
  "/:id",
  validate(documentIdSchema),
  documentController.deleteDocument
);

// Star toggle
router.post(
  "/:id/star",
  validate(documentIdSchema),
  documentController.toggleStar
);

export default router;
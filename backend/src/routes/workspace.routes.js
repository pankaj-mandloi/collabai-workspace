import { Router } from "express";
import workspaceController from "../controllers/workspace.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  workspaceIdSchema,
  inviteMemberSchema,
  acceptInvitationSchema,
  removeMemberSchema,
  updateMemberRoleSchema,
} from "../validators/workspace.validator.js";

const router = Router();

// All routes require authentication
router.use(protect);

// ============================================
// WORKSPACE CRUD ROUTES
// ============================================

// POST /api/v1/workspaces
router.post(
  "/",
  validate(createWorkspaceSchema),
  workspaceController.createWorkspace
);

// GET /api/v1/workspaces
router.get("/", workspaceController.getAllWorkspaces);

// GET /api/v1/workspaces/:id
router.get(
  "/:id",
  validate(workspaceIdSchema),
  workspaceController.getWorkspaceById
);

// PATCH /api/v1/workspaces/:id
router.patch(
  "/:id",
  validate(updateWorkspaceSchema),
  workspaceController.updateWorkspace
);

// DELETE /api/v1/workspaces/:id
router.delete(
  "/:id",
  validate(workspaceIdSchema),
  workspaceController.deleteWorkspace
);

// ============================================
// INVITATION ROUTES
// ============================================

// POST /api/v1/workspaces/:id/invitations
router.post(
  "/:id/invitations",
  validate(inviteMemberSchema),
  workspaceController.inviteMember
);

// POST /api/v1/workspaces/:id/invitations/:invitationId/accept
router.post(
  "/:id/invitations/:invitationId/accept",
  validate(acceptInvitationSchema),
  workspaceController.acceptInvitation
);

// ============================================
// MEMBER MANAGEMENT ROUTES
// ============================================

// DELETE /api/v1/workspaces/:id/members/:memberId
router.delete(
  "/:id/members/:memberId",
  validate(removeMemberSchema),
  workspaceController.removeMember
);

// PATCH /api/v1/workspaces/:id/members/:memberId/role
router.patch(
  "/:id/members/:memberId/role",
  validate(updateMemberRoleSchema),
  workspaceController.updateMemberRole
);

export default router;
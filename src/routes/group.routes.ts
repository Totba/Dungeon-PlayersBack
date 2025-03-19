import express from "express";
import {
	addMember,
	createGroup,
	getGroupById,
	getMyGroups,
	removeMember,
} from "../controllers/group.controller";
import { authenticateJWT } from "../middlewares/auth.middleware";

const router = express.Router();

// Protéger toutes les routes avec l'authentification
router.use(authenticateJWT as express.RequestHandler);

// Routes pour les groupes
router.post("/", createGroup);
router.get("/my", getMyGroups);
router.get("/:id", getGroupById);
router.post("/member", addMember);
router.delete("/:groupId/member/:userId", removeMember);

export default router;

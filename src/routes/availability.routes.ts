import express from "express";
import {
	addAvailability,
	createSession,
	deleteAvailability,
	findBestSessionTime,
	getGroupAvailabilities,
	getUserAvailabilities,
} from "../controllers/availability.controller";
import { authenticateJWT } from "../middlewares/auth.middleware";

const router = express.Router();

// Protéger toutes les routes avec l'authentification
router.use(authenticateJWT as express.RequestHandler);

// Routes pour les disponibilités
router.post("/", addAvailability);
router.get("/", getUserAvailabilities);
router.delete("/:id", deleteAvailability);
router.get("/group/:groupId", getGroupAvailabilities);

// Routes pour les sessions
router.post("/best-time", findBestSessionTime);
router.post("/session", createSession);

export default router;

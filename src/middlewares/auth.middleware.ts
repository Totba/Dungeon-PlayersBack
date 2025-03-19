import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

dotenv.config();

export interface AuthRequest extends Request {
	user?: {
		userId: number;
		role: string;
		username: string;
	};
}

export const authenticateJWT = (
	req: AuthRequest,
	res: Response,
	next: NextFunction
) => {
	const authHeader = req.headers.authorization;

	if (!authHeader) {
		return res.status(401).json({ message: "Authentification requise" });
	}

	const token = authHeader.split(" ")[1];

	try {
		const user = jwt.verify(
			token,
			process.env.JWT_SECRET || "secret_key_for_development"
		) as {
			userId: number;
			role: string;
			username: string;
		};

		req.user = user;
		next();
	} catch (error) {
		return res.status(403).json({ message: "Token invalide ou expiré" });
	}
};

export const isGameMaster = (
	req: AuthRequest,
	res: Response,
	next: NextFunction
) => {
	if (req.user && req.user.role === "game_master") {
		next();
	} else {
		res.status(403).json({ message: "Accès réservé aux maîtres de jeu" });
	}
};

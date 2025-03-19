import dotenv from "dotenv";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/database";
import { User, UserRole } from "../entities/User";

dotenv.config();

const userRepository = AppDataSource.getRepository(User);

export const register = async (req: Request, res: Response): Promise<void> => {
	try {
		const { email, password, username, role } = req.body;

		let existingUser = await userRepository.findOne({ where: { email } });
		if (existingUser) {
			res.status(400).json({ message: "Email déjà utilisé" });
			return;
		}

		const user = new User();
		user.email = email;
		user.password = password;
		user.username = username;

		// Attribution du rôle si spécifié, sinon par défaut PLAYER
		if (role && Object.values(UserRole).includes(role)) {
			user.role = role;
		}

		await user.hashPassword();

		await userRepository.save(user);
		res.status(201).json({ message: "Utilisateur enregistré !" });
	} catch (error) {
		console.error("Erreur d'enregistrement:", error);
		res.status(500).json({ error: "Erreur serveur" });
	}
};

export const login = async (req: Request, res: Response): Promise<void> => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			res.status(400).json({ errors: "Email et mot de passe requis" });
			return;
		}

		const user = await userRepository.findOne({ where: { email } });

		if (!user || !(await user.comparePassword(password))) {
			res.status(401).json({ message: "Email ou mot de passe incorrect" });
			return;
		}

		const token = jwt.sign(
			{ userId: user.id, role: user.role, username: user.username },
			process.env.JWT_SECRET || "secret_key_for_development",
			{
				expiresIn: "24h",
			}
		);

		res.status(200).json({
			token,
			user: {
				id: user.id,
				email: user.email,
				username: user.username,
				role: user.role,
			},
		});
	} catch (error) {
		console.error("Erreur de connexion:", error);
		res.status(500).json({ error: "Erreur serveur" });
	}
};

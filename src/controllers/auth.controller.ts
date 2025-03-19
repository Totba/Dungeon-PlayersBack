import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const userRepository = AppDataSource.getRepository(User);

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    let existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) res.status(400).json({ message: "Email déjà utilisé" });

    const user = new User();
    user.email = email;
    user.password = password;
    await user.hashPassword();

    await userRepository.save(user);
    res.status(201).json({ message: "Utilisateur enregistré !" });
  } catch (error) {
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
      { userId: user.id },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};
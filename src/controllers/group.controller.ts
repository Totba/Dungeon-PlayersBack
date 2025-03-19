import { Response } from "express";
import { AppDataSource } from "../config/database";
import { GameGroup } from "../entities/GameGroup";
import { User } from "../entities/User";
import { AuthRequest } from "../middlewares/auth.middleware";

const groupRepository = AppDataSource.getRepository(GameGroup);
const userRepository = AppDataSource.getRepository(User);

// Créer un nouveau groupe
export const createGroup = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const { name, description } = req.body;

		if (!req.user) {
			res.status(401).json({ message: "Authentification requise" });
			return;
		}

		const gameMaster = await userRepository.findOne({
			where: { id: req.user.userId },
		});

		if (!gameMaster) {
			res.status(404).json({ message: "Utilisateur non trouvé" });
			return;
		}

		const group = new GameGroup();
		group.name = name;
		group.description = description;
		group.gameMaster = gameMaster;
		group.isActive = true;
		group.members = [gameMaster]; // Le créateur est automatiquement membre

		await groupRepository.save(group);

		res.status(201).json({
			message: "Groupe créé avec succès",
			group: {
				id: group.id,
				name: group.name,
				description: group.description,
			},
		});
	} catch (error) {
		console.error("Erreur lors de la création du groupe:", error);
		res.status(500).json({ error: "Erreur serveur" });
	}
};

// Récupérer tous les groupes dont l'utilisateur est membre
export const getMyGroups = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		if (!req.user) {
			res.status(401).json({ message: "Authentification requise" });
			return;
		}

		const user = await userRepository.findOne({
			where: { id: req.user.userId },
			relations: ["groups", "masterGroups"],
		});

		if (!user) {
			res.status(404).json({ message: "Utilisateur non trouvé" });
			return;
		}

		// Combinez les groupes où l'utilisateur est membre et maître de jeu
		const allGroups = [...user.groups, ...user.masterGroups];

		// Éliminez les doublons éventuels
		const uniqueGroups = Array.from(new Set(allGroups.map((g) => g.id))).map(
			(id) => allGroups.find((g) => g.id === id)
		);

		res.status(200).json({ groups: uniqueGroups });
	} catch (error) {
		console.error("Erreur lors de la récupération des groupes:", error);
		res.status(500).json({ error: "Erreur serveur" });
	}
};

// Récupérer les détails d'un groupe
export const getGroupById = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;

		if (!req.user) {
			res.status(401).json({ message: "Authentification requise" });
			return;
		}

		const group = await groupRepository.findOne({
			where: { id: Number(id) },
			relations: ["members", "gameMaster", "sessions"],
		});

		if (!group) {
			res.status(404).json({ message: "Groupe non trouvé" });
			return;
		}

		// Vérifier si l'utilisateur est membre du groupe
		const isMember = group.members.some(
			(member) => member.id === req.user?.userId
		);
		const isGameMaster = group.gameMaster.id === req.user?.userId;

		if (!isMember && !isGameMaster) {
			res.status(403).json({ message: "Vous n'êtes pas membre de ce groupe" });
			return;
		}

		res.status(200).json({ group });
	} catch (error) {
		console.error("Erreur lors de la récupération du groupe:", error);
		res.status(500).json({ error: "Erreur serveur" });
	}
};

// Ajouter un membre au groupe
export const addMember = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const { groupId, userId } = req.body;

		if (!req.user) {
			res.status(401).json({ message: "Authentification requise" });
			return;
		}

		const group = await groupRepository.findOne({
			where: { id: Number(groupId) },
			relations: ["members", "gameMaster"],
		});

		if (!group) {
			res.status(404).json({ message: "Groupe non trouvé" });
			return;
		}

		// Vérifier si l'utilisateur est le maître du jeu
		if (group.gameMaster.id !== req.user.userId) {
			res
				.status(403)
				.json({ message: "Seul le maître du jeu peut ajouter des membres" });
			return;
		}

		const newMember = await userRepository.findOne({
			where: { id: Number(userId) },
		});

		if (!newMember) {
			res.status(404).json({ message: "Utilisateur non trouvé" });
			return;
		}

		// Vérifier si l'utilisateur est déjà membre
		if (group.members.some((member) => member.id === newMember.id)) {
			res
				.status(400)
				.json({ message: "L'utilisateur est déjà membre du groupe" });
			return;
		}

		group.members.push(newMember);
		await groupRepository.save(group);

		res.status(200).json({ message: "Membre ajouté avec succès" });
	} catch (error) {
		console.error("Erreur lors de l'ajout d'un membre:", error);
		res.status(500).json({ error: "Erreur serveur" });
	}
};

// Supprimer un membre du groupe
export const removeMember = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const { groupId, userId } = req.params;

		if (!req.user) {
			res.status(401).json({ message: "Authentification requise" });
			return;
		}

		const group = await groupRepository.findOne({
			where: { id: Number(groupId) },
			relations: ["members", "gameMaster"],
		});

		if (!group) {
			res.status(404).json({ message: "Groupe non trouvé" });
			return;
		}

		// Vérifier si l'utilisateur est le maître du jeu
		if (group.gameMaster.id !== req.user.userId) {
			res
				.status(403)
				.json({ message: "Seul le maître du jeu peut supprimer des membres" });
			return;
		}

		// Vérifier si l'utilisateur à supprimer est le maître du jeu
		if (Number(userId) === group.gameMaster.id) {
			res
				.status(400)
				.json({ message: "Le maître du jeu ne peut pas être supprimé" });
			return;
		}

		group.members = group.members.filter(
			(member) => member.id !== Number(userId)
		);
		await groupRepository.save(group);

		res.status(200).json({ message: "Membre supprimé avec succès" });
	} catch (error) {
		console.error("Erreur lors de la suppression d'un membre:", error);
		res.status(500).json({ error: "Erreur serveur" });
	}
};

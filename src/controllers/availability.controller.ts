import { Response } from "express";
import { In } from "typeorm";
import { AppDataSource } from "../config/database";
import { Availability } from "../entities/Availability";
import { GameGroup } from "../entities/GameGroup";
import { GameSession } from "../entities/GameSession";
import { User } from "../entities/User";
import { AuthRequest } from "../middlewares/auth.middleware";

const availabilityRepository = AppDataSource.getRepository(Availability);
const userRepository = AppDataSource.getRepository(User);
const groupRepository = AppDataSource.getRepository(GameGroup);
const sessionRepository = AppDataSource.getRepository(GameSession);

// Ajouter une disponibilité
export const addAvailability = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const { startTime, endTime } = req.body;

		if (!req.user) {
			res.status(401).json({ message: "Authentification requise" });
			return;
		}

		const user = await userRepository.findOne({
			where: { id: req.user.userId },
		});

		if (!user) {
			res.status(404).json({ message: "Utilisateur non trouvé" });
			return;
		}

		// Convertir les chaînes en objets Date
		const start = new Date(startTime);
		const end = new Date(endTime);

		// Vérification des dates
		if (isNaN(start.getTime()) || isNaN(end.getTime())) {
			res.status(400).json({ message: "Format de date invalide" });
			return;
		}

		if (start >= end) {
			res.status(400).json({
				message: "La date de début doit être antérieure à la date de fin",
			});
			return;
		}

		// Création de la disponibilité
		const availability = new Availability();
		availability.startTime = start;
		availability.endTime = end;
		availability.user = user;

		await availabilityRepository.save(availability);

		res.status(201).json({
			message: "Disponibilité ajoutée avec succès",
			availability: {
				id: availability.id,
				startTime: availability.startTime,
				endTime: availability.endTime,
			},
		});
	} catch (error) {
		console.error("Erreur lors de l'ajout de disponibilité:", error);
		res.status(500).json({ error: "Erreur serveur" });
	}
};

// Récupérer les disponibilités d'un utilisateur
export const getUserAvailabilities = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		if (!req.user) {
			res.status(401).json({ message: "Authentification requise" });
			return;
		}

		const availabilities = await availabilityRepository.find({
			where: { user: { id: req.user.userId } },
			order: { startTime: "ASC" },
		});

		res.status(200).json({ availabilities });
	} catch (error) {
		console.error("Erreur lors de la récupération des disponibilités:", error);
		res.status(500).json({ error: "Erreur serveur" });
	}
};

// Supprimer une disponibilité
export const deleteAvailability = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const { id } = req.params;

		if (!req.user) {
			res.status(401).json({ message: "Authentification requise" });
			return;
		}

		const availability = await availabilityRepository.findOne({
			where: { id: Number(id) },
			relations: ["user"],
		});

		if (!availability) {
			res.status(404).json({ message: "Disponibilité non trouvée" });
			return;
		}

		// Vérifier si la disponibilité appartient à l'utilisateur
		if (availability.user.id !== req.user.userId) {
			res.status(403).json({
				message: "Vous n'êtes pas autorisé à supprimer cette disponibilité",
			});
			return;
		}

		await availabilityRepository.remove(availability);

		res.status(200).json({ message: "Disponibilité supprimée avec succès" });
	} catch (error) {
		console.error("Erreur lors de la suppression de la disponibilité:", error);
		res.status(500).json({ error: "Erreur serveur" });
	}
};

// Récupérer les disponibilités de tous les membres d'un groupe
export const getGroupAvailabilities = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const { groupId } = req.params;

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

		// Vérifier si l'utilisateur est membre du groupe ou maître du jeu
		const isMember = group.members.some(
			(member) => member.id === req.user?.userId
		);
		const isGameMaster = group.gameMaster.id === req.user?.userId;

		if (!isMember && !isGameMaster) {
			res.status(403).json({ message: "Vous n'êtes pas membre de ce groupe" });
			return;
		}

		// Récupérer tous les IDs des membres
		const memberIds = group.members.map((member) => member.id);

		// Récupérer les disponibilités pour tous les membres
		const availabilities = await availabilityRepository.find({
			where: { user: { id: In(memberIds) } },
			relations: ["user"],
			order: { startTime: "ASC" },
		});

		// Organiser les disponibilités par utilisateur
		const availabilitiesByUser: Record<number, any[]> = {};

		availabilities.forEach((availability) => {
			const userId = availability.user.id;
			if (!availabilitiesByUser[userId]) {
				availabilitiesByUser[userId] = [];
			}
			availabilitiesByUser[userId].push({
				id: availability.id,
				startTime: availability.startTime,
				endTime: availability.endTime,
				username: availability.user.username,
			});
		});

		res.status(200).json({ availabilitiesByUser });
	} catch (error) {
		console.error(
			"Erreur lors de la récupération des disponibilités du groupe:",
			error
		);
		res.status(500).json({ error: "Erreur serveur" });
	}
};

// Trouver la meilleure date pour une session
export const findBestSessionTime = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const { groupId, durationMinutes = 180 } = req.body; // Par défaut 3 heures

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
				.json({ message: "Seul le maître du jeu peut planifier des sessions" });
			return;
		}

		// Récupérer tous les IDs des membres
		const memberIds = group.members.map((member) => member.id);

		// Récupérer les disponibilités pour tous les membres
		const availabilities = await availabilityRepository.find({
			where: { user: { id: In(memberIds) } },
			relations: ["user"],
			order: { startTime: "ASC" },
		});

		if (availabilities.length === 0) {
			res.status(400).json({
				message: "Pas de disponibilités trouvées pour les membres du groupe",
			});
			return;
		}

		// Algorithme simple pour trouver la meilleure date
		// On cherche une plage horaire où tous les membres sont disponibles
		const durationMs = durationMinutes * 60 * 1000;
		let bestStartTime: Date | null = null;
		let maxMembersAvailable = 0;

		// Plage de recherche: entre maintenant et 30 jours dans le futur
		const now = new Date();
		const oneMonthLater = new Date();
		oneMonthLater.setDate(oneMonthLater.getDate() + 30);

		// Vérifier chaque créneau avec un pas d'une heure
		for (
			let currentTime = now;
			currentTime <= oneMonthLater;
			currentTime.setHours(currentTime.getHours() + 1)
		) {
			const sessionEndTime = new Date(currentTime.getTime() + durationMs);

			let membersAvailable = 0;
			const availableMemberIds = new Set<number>();

			for (const availability of availabilities) {
				if (
					availability.startTime <= currentTime &&
					availability.endTime >= sessionEndTime
				) {
					availableMemberIds.add(availability.user.id);
				}
			}

			membersAvailable = availableMemberIds.size;

			if (membersAvailable > maxMembersAvailable) {
				maxMembersAvailable = membersAvailable;
				bestStartTime = new Date(currentTime);

				// Si tous les membres sont disponibles, on arrête la recherche
				if (membersAvailable === memberIds.length) {
					break;
				}
			}
		}

		if (!bestStartTime) {
			res
				.status(400)
				.json({ message: "Impossible de trouver un créneau commun" });
			return;
		}

		const bestEndTime = new Date(bestStartTime.getTime() + durationMs);

		res.status(200).json({
			bestStartTime,
			bestEndTime,
			membersAvailable: maxMembersAvailable,
			totalMembers: memberIds.length,
		});
	} catch (error) {
		console.error("Erreur lors de la recherche de la meilleure date:", error);
		res.status(500).json({ error: "Erreur serveur" });
	}
};

// Créer une session de jeu
export const createSession = async (
	req: AuthRequest,
	res: Response
): Promise<void> => {
	try {
		const { groupId, title, description, sessionDate, duration } = req.body;

		if (!req.user) {
			res.status(401).json({ message: "Authentification requise" });
			return;
		}

		const group = await groupRepository.findOne({
			where: { id: Number(groupId) },
			relations: ["gameMaster"],
		});

		if (!group) {
			res.status(404).json({ message: "Groupe non trouvé" });
			return;
		}

		// Vérifier si l'utilisateur est le maître du jeu
		if (group.gameMaster.id !== req.user.userId) {
			res
				.status(403)
				.json({ message: "Seul le maître du jeu peut créer des sessions" });
			return;
		}

		// Création de la session
		const session = new GameSession();
		session.title = title;
		session.description = description;
		session.sessionDate = new Date(sessionDate);
		session.duration = Number(duration);
		session.group = group;

		await sessionRepository.save(session);

		res.status(201).json({
			message: "Session créée avec succès",
			session: {
				id: session.id,
				title: session.title,
				sessionDate: session.sessionDate,
				duration: session.duration,
			},
		});
	} catch (error) {
		console.error("Erreur lors de la création de la session:", error);
		res.status(500).json({ error: "Erreur serveur" });
	}
};

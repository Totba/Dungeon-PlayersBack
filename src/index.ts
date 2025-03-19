import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import "reflect-metadata";
import { AppDataSource } from "./config/database";
import authRoutes from "./routes/auth.routes";
import availabilityRoutes from "./routes/availability.routes";
import groupRoutes from "./routes/group.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(cors({ origin: "*" }));

// Routes
app.use("/auth", authRoutes);
app.use("/groups", groupRoutes);
app.use("/availabilities", availabilityRoutes);

// Route de base
app.get("/", (req, res) => {
	res.send("Bienvenue sur l'API Dungeons & Players!");
});

// Démarrage du serveur
if (require.main === module) {
	AppDataSource.initialize()
		.then(() => {
			console.log("📦 Base de données connectée!");
			app.listen(PORT, () =>
				console.log(`🚀 Serveur démarré sur le port ${PORT}`)
			);
		})
		.catch((err) =>
			console.error("Erreur de connexion à la base de données:", err)
		);
}

export default app;

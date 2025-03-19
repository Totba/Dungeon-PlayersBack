import "reflect-metadata";
import express from "express";
import { AppDataSource } from "./config/database";
import authRoutes from "./routes/auth.routes";

import cors from "cors";

const app = express();
const PORT = 3000;

app.use(express.json());

app.use(cors({ origin: "*" }));

app.use("/auth", authRoutes);

export default app;
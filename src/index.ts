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

if (require.main === module) {
    AppDataSource.initialize()
      .then(() => {
        console.log("📦 Database connected!");
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
      })
      .catch((err) => console.error("Database connection error:", err));
  }

export default app;
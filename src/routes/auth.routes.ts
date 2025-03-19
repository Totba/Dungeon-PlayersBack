import express from "express";
import "reflect-metadata";
import { login, register } from "../controllers/auth.controller";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

export default router;

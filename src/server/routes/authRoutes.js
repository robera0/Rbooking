import { login, refresh } from "../controllers/authController";
import express from "express";

const authrouter = express.Router();

authrouter.post("login", login);
authrouter.post("/token", refresh);

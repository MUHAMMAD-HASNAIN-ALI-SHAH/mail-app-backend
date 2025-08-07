import express from "express";
const router = express.Router();

import { register, login, verify, logout } from "../controllers/auth.controller.js";

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/verify").get(verify);
router.route("/logout").get(logout);

export default router;
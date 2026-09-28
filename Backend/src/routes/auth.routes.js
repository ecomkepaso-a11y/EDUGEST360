import express from "express";
import { login } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.js";
import { loginSchema } from "../validators/auth.validator.js";

const router = express.Router();

router.post("/login",validate(loginSchema),login);

export default router;
import express from "express";
import { create } from "../controllers/baremeFrais.controller.js";
import { validate } from "../middlewares/validate.js";
import authenticate from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/rbac.middleware.js";
import { createBaremeFraisSchema } from "../validators/baremeFrais.validator.js";

const router = express.Router();
router.use(authenticate);
router.post("/", authorize("direction"), validate(createBaremeFraisSchema), create);

export default router;

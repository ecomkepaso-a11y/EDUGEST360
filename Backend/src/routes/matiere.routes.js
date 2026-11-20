import express from "express";
import { create, habiliter } from "../controllers/matiere.controller.js";
import { validate } from "../middlewares/validate.js";
import authenticate from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/rbac.middleware.js";
import { createMatiereSchema } from "../validators/matiere.validator.js";

const router = express.Router();
router.use(authenticate);

router.post("/", authorize("direction", "personnel"), validate(createMatiereSchema), create);
router.post("/:id/enseignants/:ens_id", authorize("direction", "personnel"), habiliter);

export default router;
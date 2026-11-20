import express from "express";
import { create, getAll, update } from "../controllers/salle.controller.js";
import { validate } from "../middlewares/validate.js";
import authenticate from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/rbac.middleware.js";
import { createSalleSchema, updateSalleSchema } from "../validators/salle.validator.js";

const router = express.Router();
router.use(authenticate);

router.post("/", authorize("direction", "personnel"), validate(createSalleSchema), create);
router.get("/", authorize("direction", "personnel", "enseignant"), getAll);
router.put("/:id", authorize("direction", "personnel"), validate(updateSalleSchema), update);

export default router;
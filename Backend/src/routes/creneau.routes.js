import express from "express";
import { create, update, annuler, verifier } from "../controllers/creneau.controller.js";
import { validate } from "../middlewares/validate.js";
import authenticate from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/rbac.middleware.js";
import { createCreneauSchema, updateCreneauSchema, verifierCreneauSchema } from "../validators/creneau.validator.js";

const router = express.Router();
router.use(authenticate);

router.post("/", authorize("direction", "personnel"), validate(createCreneauSchema), create);


router.post("/verifier", authorize("direction", "personnel"), validate(verifierCreneauSchema), verifier);

router.put("/:id", authorize("direction", "personnel"), validate(updateCreneauSchema), update);
router.delete("/:id", authorize("direction", "personnel"), annuler);

export default router;
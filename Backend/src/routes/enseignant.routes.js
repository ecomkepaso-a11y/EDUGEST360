import express from "express";
import {create,getAll,getOne,update,remove,attachUtilisateur,} from "../controllers/enseignant.controller.js";
import { validate } from "../middlewares/validate.js";
import { createEnseignantSchema } from "../validators/enseignant.validator.js";
import authenticate from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/rbac.middleware.js";

const router = express.Router();
router.use(authenticate);

router.post("/",authorize("direction","personnel"), validate(createEnseignantSchema), create);
router.get("/",authorize("direction","personnel"), getAll);
router.get("/:enseignant_id",authorize("direction","personnel"), getOne);
router.put("/:enseignant_id", authorize("direction","personnel"), update);
router.delete("/:enseignant_id", authorize("direction","personnel"), remove);
router.put("/:enseignant_id/utilisateur",authorize("direction","personnel"),attachUtilisateur);

export default router;
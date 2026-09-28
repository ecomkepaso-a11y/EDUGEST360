import express from "express";
import {create,getAll,getOne,update,remove,attachUtilisateur,} from "../controllers/eleve.controller.js";
import { validate } from "../middlewares/validate.js";
import { createEleveSchema } from "../validators/eleve.validator.js";
import authenticate from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/rbac.middleware.js";

const router = express.Router();
router.use(authenticate);

router.post("/",authorize("direction","personnel"), validate(createEleveSchema), create);
router.get("/",authorize("direction","personnel"), getAll);
router.get("/:mat_eleve",authorize("direction","personnel"), getOne);
router.put("/:mat_eleve", authorize("direction","personnel"), update);
router.delete("/:mat_eleve", authorize("direction","personnel"), remove);
router.patch("/:mat_eleve/rattacher-utilisateur", authorize("direction","personnel"), attachUtilisateur);

export default router;
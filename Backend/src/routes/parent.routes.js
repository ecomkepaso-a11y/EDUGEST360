import express from "express";
import {create,getAll,getOne,update,remove,} from "../controllers/parent.controller.js";
import { validate } from "../middlewares/validate.js";
import { createParentSchema } from "../validators/parent.validator.js";
import {createResponsabiliteSchema} from "../validators/estResponsableDe.validator.js";
import {create as createResponsabilite,} from "../controllers/estResponsableDe.controller.js";
import authenticate from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/rbac.middleware.js";

const router = express.Router();
router.use(authenticate);

//Les routes pour les parents avec qui est authorise.
router.post("/",authorize("direction","personnel"), validate(createParentSchema), create);
router.get("/",authorize("direction","personnel"), getAll);
router.get("/:com_id",authorize("direction","personnel"), getOne);
router.put("/:com_id", authorize("direction","personnel"), update);
router.delete("/:com_id", authorize("direction","personnel"), remove);
router.post("/:com_id/enfants/:mat_eleve", authorize("direction","personnel"), validate(createResponsabiliteSchema), createResponsabilite);

export default router;
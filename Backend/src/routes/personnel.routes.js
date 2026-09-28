import express from "express";
import {create,getAll,getOne,update,remove,attachUtilisateur,} from "../controllers/personnel.controller.js";
import { validate } from "../middlewares/validate.js";
import { createPersonnelSchema } from "../validators/personnel.validator.js";
import authenticate from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/rbac.middleware.js";

const router = express.Router();
router.use(authenticate);
router.post("/",authorize("direction"), validate(createPersonnelSchema), create);
router.get("/",authorize("direction"), getAll);
router.get("/:rh_id",authorize("direction"), getOne);
router.put("/:rh_id", authorize("direction"), update);
router.delete("/:rh_id", authorize("direction"), remove);
router.put("/:rh_id/utilisateur",authorize("direction"),attachUtilisateur);

export default router;
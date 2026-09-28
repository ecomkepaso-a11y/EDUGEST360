import express from "express";
import {create,getAll,getOne,update,} from "../controllers/utilisateur.controller.js";
import { validate } from "../middlewares/validate.js";
import {createUtilisateurSchema,} from "../validators/utilisateur.validator.js";
import allowSelfOrRoles from "../middlewares/selfUser.middleware.js";
import authenticate from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/rbac.middleware.js";

const router = express.Router();
 
router.use(authenticate)

router.post("/",authorize("direction","personnel"),validate(createUtilisateurSchema),create);
router.get("/", getAll);
router.get("/:usr_id", allowSelfOrRoles("direction", "personnel"), getOne);
router.put("/:usr_id",allowSelfOrRoles("direction","personnel"), update);

export default router;
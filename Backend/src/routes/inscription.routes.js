import express from "express";
import {create,getAll,getOne,markPiece,} from "../controllers/inscription.controller.js";
import { validate } from "../middlewares/validate.js";
import authenticate from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/rbac.middleware.js";
import {createInscriptionSchema,} from "../validators/inscription.validator.js";

const router = express.Router();

router.use(authenticate);

/*
 * Création du dossier d'inscription.
 */
router.post(
    "/",
    authorize("direction", "personnel"),
    validate(createInscriptionSchema),
    create
);


router.get("/",authorize("direction", "personnel"),getAll);

/*
 * Consultation d'un dossier complet
 * avec ses pièces.
 */
router.get("/:ins_id",authorize("direction", "personnel"),getOne);

/*
 * Marquer une pièce comme fournie.
 */
router.patch("/:ins_id/pieces/:piece_id",authorize("direction", "personnel"),markPiece);

export default router;
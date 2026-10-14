import express from "express";
import {create,getAll,getOne,markPiece,validate as validateInscriptionHandler, refuse, cancel, reinscription} from "../controllers/inscription.controller.js";
import { validate } from "../middlewares/validate.js";
import authenticate from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/rbac.middleware.js";
import {createInscriptionSchema, reinscriptionSchema} from "../validators/inscription.validator.js";
import { validerInscriptionSchema } from "../validators/inscriptionValidation.validator.js"


const router = express.Router();

router.use(authenticate);

/*
 * Création du dossier d'inscription.
 */
router.post("/",authorize("direction", "personnel"),validate(createInscriptionSchema),create);


router.get("/",authorize("direction", "personnel"),getAll);

/*
 * Réinscription : doit être déclarée avant la route générique /:ins_id.
 */
router.post(
    "/reinscription",
    authorize("direction", "personnel"),
    validate(reinscriptionSchema),
    reinscription
);

/*
 * Consultation d'un dossier complet
 * avec ses pièces.
 */
router.get("/:ins_id",authorize("direction", "personnel"),getOne);

/*
 * Marquer une pièce comme fournie.
 */
router.patch("/:ins_id/pieces/:piece_id",authorize("direction", "personnel"),markPiece);

router.post("/:ins_id/valider",authenticate,authorize("direction", "personnel"),validate(validerInscriptionSchema),validateInscriptionHandler);

router.post(
    "/:ins_id/refuser",
    authenticate,
    authorize("direction", "personnel"),
    refuse
);

router.post(
    "/:ins_id/annuler",
    authenticate,
    authorize("direction", "personnel"),
    cancel
);

export default router;
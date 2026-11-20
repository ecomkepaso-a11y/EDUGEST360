import express from "express";
import { classe, enseignant, eleve, salle, libres } from "../controllers/planning.controller.js";
import authenticate from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/rbac.middleware.js";
import { validateQuery, sallesLibresQuerySchema, periodeQuerySchema } from "../validators/planning.validator.js";

const router = express.Router();
router.use(authenticate);

// Premier filtre par rôle ; le contrôle « propriétaire » fin est fait dans le service.
router.get("/classes/:code_classe", authorize("direction", "personnel", "enseignant", "élève", "eleve", "parent"), classe);
router.get("/enseignants/:id", authorize("direction", "personnel", "enseignant"), validateQuery(periodeQuerySchema), enseignant);
router.get("/eleves/:mat_eleve", authorize("direction", "personnel", "élève", "eleve", "parent"), eleve);

// /salles/libres AVANT /salles/:id
router.get("/salles/libres", authorize("direction", "personnel"), validateQuery(sallesLibresQuerySchema), libres);
router.get("/salles/:id", authorize("direction", "personnel"), salle);

export default router;
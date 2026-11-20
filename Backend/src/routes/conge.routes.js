import express from "express";
import { creneauxImpactes } from "../controllers/conge.controller.js";
import authenticate from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/rbac.middleware.js";

const router = express.Router();
router.use(authenticate);

router.get("/:conge_id/creneaux-impactes", authorize("direction", "personnel"), creneauxImpactes);

export default router;
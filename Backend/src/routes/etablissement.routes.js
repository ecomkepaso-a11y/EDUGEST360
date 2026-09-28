import express from "express";
import {create,getAll,getOne,update,remove,} from "../controllers/etablissement.controller.js";
import authenticate from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/rbac.middleware.js";

const router = express.Router();


// Toutes les routes établissement nécessitent un JWT
router.use(authenticate);


/*
 * ============================================================
 * ETABLISSEMENT ROUTES
 * ============================================================
 */

// POST /api/v1/etablissements
router.post("/",authorize("direction"), create);

// GET /api/v1/etablissements
router.get("/",authorize("direction"),getAll);

// GET /api/v1/etablissements/:eta_id
router.get("/:eta_id",authorize("direction","personnel"), getOne);

// PUT /api/v1/etablissements/:eta_id
router.put("/:eta_id",authorize("direction"), update);

// DELETE /api/v1/etablissements/:eta_id
router.delete("/:eta_id",authorize("direction"), remove);

export default router;
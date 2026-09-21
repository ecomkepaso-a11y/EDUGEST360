import express from "express";
import {create,getAll,getOne,update,remove,} from "../controllers/etablissement.controller.js";

const router = express.Router();


/*
 * ============================================================
 * ETABLISSEMENT ROUTES
 * ============================================================
 */

// POST /api/v1/etablissements
router.post("/", create);

// GET /api/v1/etablissements
router.get("/", getAll);

// GET /api/v1/etablissements/:eta_id
router.get("/:eta_id", getOne);

// PUT /api/v1/etablissements/:eta_id
router.put("/:eta_id", update);

// DELETE /api/v1/etablissements/:eta_id
router.delete("/:eta_id", remove);

export default router;
import express from "express";
import {create,getAll,getOne,update,remove,attachUtilisateur,} from "../controllers/eleve.controller.js";

const router = express.Router();

router.post("/", create);
router.get("/", getAll);
router.get("/:mat_eleve", getOne);
router.put("/:mat_eleve", update);
router.delete("/:mat_eleve", remove);

router.put(
    "/:mat_eleve/utilisateur",
    attachUtilisateur
);

export default router;
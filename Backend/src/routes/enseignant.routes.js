import express from "express";
import {create,getAll,getOne,update,remove,attachUtilisateur,} from "../controllers/enseignant.controller.js";

const router = express.Router();

router.post("/", create);
router.get("/", getAll);
router.get("/:enseignant_id", getOne);
router.put("/:enseignant_id", update);
router.delete("/:enseignant_id", remove);

router.put(
    "/:enseignant_id/utilisateur",
    attachUtilisateur
);

export default router;
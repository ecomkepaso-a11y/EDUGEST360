import express from "express";
import {create,getAll,getOne,update,remove,attachUtilisateur,} from "../controllers/personnel.controller.js";

const router = express.Router();

router.post("/", create);
router.get("/", getAll);
router.get("/:rh_id", getOne);
router.put("/:rh_id", update);
router.delete("/:rh_id", remove);

router.put(
    "/:rh_id/utilisateur",
    attachUtilisateur
);

export default router;
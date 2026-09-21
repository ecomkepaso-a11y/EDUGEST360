import express from "express";
import {create,getAll,getByEleve,getByParent,update,remove,} from "../controllers/estResponsableDe.controller.js";

const router = express.Router();

router.post("/", create);
router.get("/", getAll);

router.get(
    "/eleve/:mat_eleve",
    getByEleve
);

router.get(
    "/parent/:com_id",
    getByParent
);

router.put(
    "/:mat_eleve/:com_id",
    update
);

router.delete(
    "/:mat_eleve/:com_id",
    remove
);

export default router;
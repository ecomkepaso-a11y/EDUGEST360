import express from "express";
import {create,getAll,getByEleve,getByParent,update,remove,} from "../controllers/estResponsableDe.controller.js";
import { validate } from "../middlewares/validate.js";
import {createResponsabiliteSchema} from "../validators/estResponsableDe.validator.js";

const router = express.Router();

router.post("/", validate(createResponsabiliteSchema), create);
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
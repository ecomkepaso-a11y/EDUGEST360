import express from "express";
import {create,getAll,getOne,update,} from "../controllers/utilisateur.controller.js";

const router = express.Router();

router.post("/", create);
router.get("/", getAll);
router.get("/:usr_id", getOne);
router.put("/:usr_id", update);

export default router;
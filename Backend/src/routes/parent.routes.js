import express from "express";
import {create,getAll,getOne,update,remove,} from "../controllers/parent.controller.js";

const router = express.Router();

router.post("/", create);
router.get("/", getAll);
router.get("/:com_id", getOne);
router.put("/:com_id", update);
router.delete("/:com_id", remove);

export default router;
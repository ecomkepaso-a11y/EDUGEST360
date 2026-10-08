import express from "express";
import {create,getAll,getOne,update,remove,} from "../controllers/pieceRequise.controller.js";
import { validate } from "../middlewares/validate.js";
import authenticate from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/rbac.middleware.js";
import {createPieceRequiseSchema,updatePieceRequiseSchema,} from "../validators/pieceRequise.validator.js";

const router = express.Router();

router.use(authenticate);

/*
 *
 * Direction et personnel peuvent administrer
 * le catalogue.
 */

router.post(
    "/",
    authorize("direction", "personnel"),
    validate(createPieceRequiseSchema),
    create
);

router.get(
    "/",
    authorize("direction", "personnel"),
    getAll
);

router.get(
    "/:piece_id",
    authorize("direction", "personnel"),
    getOne
);

router.put(
    "/:piece_id",
    authorize("direction", "personnel"),
    validate(updatePieceRequiseSchema),
    update
);

router.delete(
    "/:piece_id",
    authorize("direction", "personnel"),
    remove
);

export default router;
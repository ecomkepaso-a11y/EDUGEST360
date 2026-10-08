import express from "express";

import {
    create,
    getAll,
    getOne,
    update,
    remove,
} from "../controllers/classe.controller.js";

import { validate } from "../middlewares/validate.js";
import authenticate from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/rbac.middleware.js";

import {
    createClasseSchema,
} from "../validators/classe.validator.js";

const router = express.Router();

router.use(authenticate);

/*
|--------------------------------------------------------------------------
| Création
|--------------------------------------------------------------------------
| Direction + personnel
*/

router.post(
    "/",
    authorize("direction", "personnel"),
    validate(createClasseSchema),
    create
);

/*
|--------------------------------------------------------------------------
| Consultation
|--------------------------------------------------------------------------
| Direction + personnel + enseignant
*/

router.get(
    "/",
    authorize("direction", "personnel", "enseignant"),
    getAll
);

router.get(
    "/:code_classe",
    authorize("direction", "personnel", "enseignant"),
    getOne
);

/*
|--------------------------------------------------------------------------
| Modification
|--------------------------------------------------------------------------
*/

router.put(
    "/:code_classe",
    authorize("direction", "personnel"),
    update
);

/*
|--------------------------------------------------------------------------
| Desactivation
|--------------------------------------------------------------------------
*/

router.delete(
    "/:code_classe",
    authorize("direction", "personnel"),
    remove
);

export default router;
import { getWelcomeMessage } from "../services/welcome.service.js";
import { successResponse } from "../utils/response.js";

export const ping = (req, res) => {
    return successResponse(
        res,
        null,
        "Pong",
        200
    )
}

export const welcome = (req, res) => {
    const name = req.query.name || "Student";

    const message = getWelcomeMessage(name);

    return successResponse(
        res,
        {message},
        "Welcome message generated successfully",
        200
    )
}
import jwt from "jsonwebtoken";
import UsersModel from "../models/usersModel.js";
import { errorCatch, sendErrorResp } from "../utils/index.js";
import { JWT_SECRET_KEY } from "../constants.js";

export async function userAuth(req, res, next) {
    try {
        const token = req.cookies.token || "";
        if (!token.trim()) return sendErrorResp(res, 403, "token is not valid");

        const { _id } = await jwt.verify(token, JWT_SECRET_KEY) || {};
        if (!_id) return sendErrorResp(res, 403, "not authorized");

        const userObj = await UsersModel.findOne({ _id });
        if (userObj) {
            req.loggedUser = userObj; // storing the found user's mongoDB object in req body so that it can be accessed from other middlewares
            return next();
        } else return sendErrorResp(res, 404, "user not found");
    } catch (err) {
        errorCatch(err, req, res);
    }
}
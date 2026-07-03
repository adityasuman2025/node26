import jwt from "jsonwebtoken";
import UsersModel from "../models/Users.js";
import { errorCatch, sendErrorResp } from "../utils.js"
import { JWT_SECRET_KEY } from "../constants.js";

export async function userAuth(req, res, next) {
    try {
        const token = req.cookies.token || "";
        if (!token.trim()) return sendErrorResp(res, 403, "token is not valid");

        const { _id } = await jwt.verify(token, JWT_SECRET_KEY) || {};
        if (!_id) return sendErrorResp(res, 403, "token is not valid");

        const userObj = await UsersModel.findOne({ _id });
        if (userObj) {
            req.userObj = userObj.toObject(); // passing the found user object to next middleware
            return next();
        }

        return sendErrorResp(res, 403, "un-authorized");
    } catch (err) {
        errorCatch(err, req, res);
    }
}
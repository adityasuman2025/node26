import express from "express";
import UsersModel from "../models/Users.js";
import { userAuth } from "../middlewares/auth.js";
import { sendErrorResp, sendResp, apiHandler } from "../utils.js";
import { ALLOWED_USER_FIELDS } from "../constants.js";

const userRouter = express.Router();

userRouter.get("/user", userAuth, (...args) => {
    apiHandler(async (req, res) => {
        const userObj = req.userObj;
        if (Object.keys(userObj).length) {
            const { _id, password, createdAt, updatedAt, __v, ...rest } = req.userObj || {};
            return sendResp(res, rest);
        } else return sendErrorResp(res, 404, "user not found");
    }, ...args);
});

userRouter.delete("/user", userAuth, (...args) => {
    apiHandler(async (req, res) => {
        const userObj = req.userObj;
        if (Object.keys(userObj).length) {
            const data = await UsersModel.deleteOne({ _id: userObj._id });

            if (data.deletedCount > 0) return sendResp(res, "user deleted");
            else return sendErrorResp(res, 404, "user not found");
        } else return sendErrorResp(res, 404, "user not found");
    }, ...args);
});

userRouter.patch("/user", userAuth, (...args) => {
    apiHandler(async (req, res) => {
        const userObj = req.userObj;
        if (Object.keys(userObj).length) {
            const updateData = Object.keys(req.body || {}).reduce((acc, key) => ({ ...acc, ...(ALLOWED_USER_FIELDS.includes(key) ? { [key]: req.body[key] } : {}) }), {});
            if (Object.keys(updateData).length === 0) return sendErrorResp(res, 400, "no fields provided for update");

            const data = await UsersModel.updateOne({ _id: userObj._id }, { ...updateData }, { runValidators: true });
            if (data.matchedCount > 0) sendResp(res, "user data updated");
            else return sendErrorResp(res, 404, "user not found");
        } else return sendErrorResp(res, 404, "user not found");
    }, ...args);
});

export default userRouter;

import express from "express";
import validator from "validator";
import UsersModel from "../models/usersModel.js";
import { userAuth } from "../middlewares/auth.js";
import { sendErrorResp, sendResp, apiHandler, getHashedPassword } from "../utils/index.js";
import { getValidEditUserInput } from "../utils/validation.js";

const profileRouter = express.Router();

profileRouter.get("/", userAuth, (...args) => {
    apiHandler(async (req, res) => {
        const loggedUser = req.loggedUser;
        if (loggedUser) {
            const { password, ...rest } = loggedUser.toObject() || {}; // toObject() converts the mongodb object to plain JS object 
            return sendResp(res, rest);
        } else return sendErrorResp(res, 404, "user not found");
    }, ...args);
});

profileRouter.delete("/", userAuth, (...args) => {
    apiHandler(async (req, res) => {
        const loggedUser = req.loggedUser;
        if (loggedUser) {
            const data = await UsersModel.deleteOne({ _id: loggedUser._id });

            if (data.deletedCount > 0) return sendResp(res, "user deleted");
            else return sendErrorResp(res, 404, "user not found");
        } else return sendErrorResp(res, 404, "user not found");
    }, ...args);
});

profileRouter.patch("/", userAuth, (...args) => {
    apiHandler(async (req, res) => {
        const loggedUser = req.loggedUser;
        if (loggedUser) {
            const updateData = getValidEditUserInput(req.body);
            if (Object.keys(updateData).length === 0) return sendErrorResp(res, 400, "no fields provided for update");

            await UsersModel.updateOne({ _id: loggedUser._id }, { ...updateData }, { runValidators: true });
            return sendResp(res, "user data updated");
        } else return sendErrorResp(res, 404, "user not found");
    }, ...args);
});

profileRouter.patch("/changePassword", userAuth, (...args) => {
    apiHandler(async (req, res) => {
        const loggedUser = req.loggedUser;
        if (loggedUser) {
            const { oldPassword = "", newPassword = "" } = req.body || {};
            if (!oldPassword.trim() || !newPassword.trim()) return sendErrorResp(res, 400, "new or old password is missing");
            if (!validator.isStrongPassword(newPassword)) return sendErrorResp(res, 400, "password is not strong enough");

            const isOldPasswordValid = await loggedUser.validatePassword(oldPassword);
            if (isOldPasswordValid) {
                const hashedPassword = await getHashedPassword(newPassword);

                await UsersModel.updateOne({ _id: loggedUser._id }, { password: hashedPassword }, { runValidators: true });
                return sendResp(res, "password updated");
            } else return sendErrorResp(res, 400, "old password is wrong");
        } else return sendErrorResp(res, 404, "user not found");
    }, ...args);
});

export default profileRouter;

import { Router } from "express";
import validator from "validator";
import bcrypt from "bcrypt";
import UsersModel from "../models/Users.js";
import { sendErrorResp, sendResp, apiHandler } from "../utils.js";
import { AUTH_TOKEN_KEY } from "../constants.js";

const authRouter = Router();

// /auth/signup
authRouter.post("/signup", (...args) => {
    apiHandler(async (req, res) => {
        const { name = "", email = "", password = "" } = req.body || {};
        if (!name.trim() || !email.trim() || !password.trim() || !validator.isEmail(email)) return sendErrorResp(res, 400, "invalid name, email or password");
        if (!validator.isStrongPassword(password)) return sendErrorResp(res, 400, "password is not strong enough");

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = UsersModel({ name, email, password: hashedPassword });
        await user.save();

        return sendResp(res, "new user added")
    }, ...args);
});

// /auth/login
authRouter.post("/login", (...args) => {
    apiHandler(async (req, res) => {
        const { email = "", password = "" } = req.body || {};
        if (!email.trim() || !password.trim() || !validator.isEmail(email)) return sendErrorResp(res, 400, "invalid email or password");

        const user = await UsersModel.findOne({ email });
        if (user) {
            const isPasswordValid = await user.validatePassword(password);
            if (isPasswordValid) {
                const jwtToken = await user.createJWT();
                res.cookie(AUTH_TOKEN_KEY, jwtToken);

                return sendResp(res, "logged in successfully");
            } else return sendErrorResp(res, 400, "invalid credentials");
        } else return sendErrorResp(res, 400, "invalid credentials");
    }, ...args);
});

// /auth/logout
authRouter.get("/logout", (...args) => {
    apiHandler(async (req, res) => {
        res.cookie(AUTH_TOKEN_KEY, null, { expires: new Date() }); // expiring the cookies just now
        sendResp(res, "logged out successfully");
    }, ...args);
});

export default authRouter;
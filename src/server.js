import express from "express";
import validator from "validator";
import dbConnection from "./db.js";
import UsersModel from "./models/Users.js";
import { sendErrorResp, sendResp, apiHandler } from "./utils.js";
import { PORT } from "./constants.js";

const app = new express();
app.use(express.json()); // express.json() middleware parses the incoming HTTP request to get JSON payload

app.post("/signup", (...args) => {
    apiHandler(async (req, res) => {
        const { name, email, password, address, gender, age, profilePic, skills } = req.body || {};

        const obj = UsersModel({ name, email, password, address, gender, age, profilePic, skills });
        await obj.save();

        return sendResp(res, "new user added")
    }, ...args);
});

app.post("/login", (...args) => {
    apiHandler(async (req, res) => {
        const { email = "", password = "" } = req.body || {};
        if (!email.trim() || !password.trim() || !validator.isEmail(email)) return sendErrorResp(res, 400, "invalid email or password");

        const data = await UsersModel.find({ email, password });
        if (data.length) return sendResp(res, data[0]);
        else return sendErrorResp(res, 404, "user not found");
    }, ...args);
});

app.delete("/users/:id", (...args) => {
    apiHandler(async (req, res) => {
        const id = req.params.id || "";
        if (!id.trim()) return sendErrorResp(res, 400, "missing id");

        const data = await UsersModel.deleteOne({ _id: id });
        if (data.deletedCount > 0) return sendResp(res, "user deleted");
        else return sendErrorResp(res, 404, "user not found");
    }, ...args);
});

app.patch("/users/:id", (...args) => {
    apiHandler(async (req, res) => {
        const id = req.params.id || "";
        if (!id.trim()) return sendErrorResp(res, 400, "missing id");

        const allowedFields = ["name", "address", "gender", "age", "profilePic", "skills"];
        const updateData = Object.keys(req.body || {}).reduce((acc, key) => ({ ...acc, ...(allowedFields.includes(key) ? { [key]: req.body[key] } : {}) }), {});
        if (Object.keys(updateData).length === 0) return sendErrorResp(res, 400, "no fields provided for update");

        const data = await UsersModel.updateOne({ _id: id }, { ...updateData }, { runValidators: true });
        if (data.matchedCount > 0) sendResp(res, "user data updated");
        else return sendErrorResp(res, 404, "user not found");
    }, ...args);
});


// default apis
app.get("/ping", (req, res) => res.send("pong"));
app.get("/", (req, res) => res.send("welcome to MNgo backend server"));

// handles error for all routes
app.use("/", (err, req, res, next) => {
    if (err) return sendErrorResp(res, 500, "something went wrong")
});

dbConnection
    .then(() => {
        app.listen(PORT, () => console.log("server running on", PORT))
    })
    .catch(() => console.log("db connection failed"))
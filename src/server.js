import express from "express";
import dbConnection from "./db.js";
import UsersModel from "./models/Users.js";
import { sendErrorResp, sendResp } from "./utils.js";
import { PORT } from "./constants.js";

const app = new express();

app.use(express.json()); // express.json() middleware parses the incoming HTTP request to get JSON payload

app.post("/signup", async (req, res) => {
    try {
        const { name, email, password, address, gender } = req.body || {};

        const obj = UsersModel({ name, email, password, address, gender });
        await obj.save();

        sendResp(res, "new user added")
    } catch (e) {
        console.log("POST /signup threw error", e)
        sendErrorResp(res, 500, "something went wrong");
    }
});

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body || {};

        const data = await UsersModel.find({ email, password });
        if (data.length) sendResp(res, data[0]);
        else sendErrorResp(res, 404, "user not found");
    } catch (e) {
        console.log("POST /login threw error", e)
        sendErrorResp(res, 500, "something went wrong");
    }
});

app.delete("/users", async (req, res) => {
    try {
        const { id } = req.body || {};

        const data = await UsersModel.deleteOne({ _id: id });
        if (data.deletedCount > 0) sendResp(res, "user deleted");
        else sendErrorResp(res, 404, "user not found");
    } catch (e) {
        console.log("DELETE /users threw error", e)
        sendErrorResp(res, 500, "something went wrong");
    }
});

app.patch("/users", async (req, res) => {
    try {
        const { id, ...rest } = req.body || {};

        const data = await UsersModel.updateOne({ _id: id }, { ...rest });
        if (data.matchedCount > 0) sendResp(res, "user data updated");
        else sendErrorResp(res, 404, "user not found");
    } catch (e) {
        console.log("PATCH /users threw error", e)
        sendErrorResp(res, 500, "something went wrong");
    }
});


// default apis
app.get("/ping", (req, res) => {
    res.send("pong");
});
app.get("/", (req, res) => {
    res.send("welcome to MNgo backend server");
});

// handles error for all routes
app.use("/", (err, req, res, next) => {
    if (err) res.status(500).send("something went wrong")
});

dbConnection
    .then(() => {
        app.listen(PORT, () => console.log("server running on", PORT))
    })
    .catch(() => console.log("db connection failed"))
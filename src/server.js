import express from "express";
import cookieParser from "cookie-parser";
import dbConnection from "./db.js";
import authRouter from "./routes/authRouter.js";
import profileRouter from "./routes/profileRouter.js";
import userRouter from "./routes/userRouter.js";
import connectionRouter from "./routes/connectionRouter.js";
import { sendErrorResp } from "./utils/index.js";
import { PORT } from "./constants.js";

const app = new express();
app.use(express.json()); // express.json() middleware parses the incoming HTTP request to get JSON payload
app.use(cookieParser()); // cookie-parser middleware parses the cookie containing in the API request

app.use("/auth", authRouter);
app.use("/profile", profileRouter);
app.use("/user", userRouter);
app.use("/connection", connectionRouter);

// default apis
app.get("/ping", (req, res) => res.send("pong"));
app.get("/", (req, res) => res.send("welcome to MNgo backend server"));

// handles error for all routes
app.use("/", (err, req, res, next) => {
    if (err) return sendErrorResp(res, 500, "something went wrong")
});

dbConnection
    .then(() => app.listen(PORT, () => console.log("server running on", PORT)))
    .catch(() => console.log("db connection failed"))
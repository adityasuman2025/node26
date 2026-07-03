import mongoose from "mongoose";
import { errorCatch } from "../utils/index.js"

export default function checkDbConnection(req, res, next) {
    try {
        if (mongoose.connection.readyState !== 1) throw new Error("database is not connected");
        next();
    } catch (err) {
        errorCatch(err, req, res);
    }
}
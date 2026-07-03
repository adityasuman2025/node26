import mongoose from "mongoose";
import { errorCatch } from "../utils/index.js";
import dbConnection from "../db.js";

export default async function checkDbConnection(req, res, next) {
    try {
        if (mongoose.connection.readyState !== 1) {
            await dbConnection; // wait for connection to establish on cold starts
        }
        next();
    } catch (err) {
        errorCatch(err, req, res);
    }
}
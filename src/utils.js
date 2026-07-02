import mongoose from "mongoose";

export function sendErrorResp(res, status, error) {
    return res.status(status).send({ status, error })
}

export function sendResp(res, data) {
    return res.status(200).send({ status: 200, data })
}

export async function apiHandler(func, req, res, next) {
    try {
        await func(req, res, next);
    } catch (e) {
        console.log(req?.route?.path, "api error:", e.message)
        if (e instanceof mongoose.Error || e.name === "MongoServerError") return sendErrorResp(res, 400, e.message);
        sendErrorResp(res, 500, "something went wrong");
    }
}
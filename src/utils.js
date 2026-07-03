import mongoose from "mongoose";

export function sendErrorResp(res, status, error) {
    return res.status(status).send({ status, error })
}

export function sendResp(res, data) {
    return res.status(200).send({ status: 200, data })
}

export function errorCatch(err, req, res) {
    console.log(req.method, req?.route?.path, "api error:", err.message)
    if (err instanceof mongoose.Error || err.name === "MongoServerError") return sendErrorResp(res, 400, err.message);
    sendErrorResp(res, 500, "something went wrong");
}

export async function apiHandler(func, req, res, next) {
    try {
        await func(req, res, next);
    } catch (err) {
        errorCatch(err, req, res);
    }
}
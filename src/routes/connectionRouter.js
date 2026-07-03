import { Router } from "express";
import ConnectionsModel, { STATUS_INTERESTED, STATUS_IGNORED, STATUS_ACCEPTED, STATUS_REJECTED } from "../models/connectionsModel.js";
import UsersModel from "../models/usersModel.js";
import { userAuth } from "../middlewares/auth.js";
import { apiHandler, sendErrorResp, sendResp } from "../utils/index.js";

const connectionRouter = Router();

connectionRouter.post("/send/:status/:toUserId", userAuth, (...args) => {
    apiHandler(async (req, res) => {
        const loggedUser = req.loggedUser;
        if (loggedUser) {
            const fromUserId = loggedUser._id;
            const { toUserId = "", status = "" } = req.params || {};
            if (!fromUserId || !toUserId.trim() || !status.trim()) return sendErrorResp(res, 400, "missing status or to user id");
            if (![STATUS_INTERESTED, STATUS_IGNORED].includes(status)) return sendErrorResp(res, 400, status + " is not allowed");
            // if (toUserId.trim() === fromUserId.toString()) return sendErrorResp(res, 400, "can't make connection with itself"); // handled at schema level in pre hook in connectionsModel.js file

            const doesToUserExistsInDb = await UsersModel.findOne({ _id: toUserId });
            if (!doesToUserExistsInDb) return sendErrorResp(res, 404, "to user not found");

            const doesAConnectionAlreadyExists = await ConnectionsModel.findOne({
                $or: [{ fromUserId, toUserId }, { fromUserId: toUserId, toUserId: fromUserId }]
            });
            if (doesAConnectionAlreadyExists) return sendErrorResp(res, 400, "connection already exists");

            const connectionObj = new ConnectionsModel({ fromUserId, toUserId, status });
            await connectionObj.save();

            return sendResp(res, "connection " + status + " sent successfully");
        } else return sendErrorResp(res, 404, "user not found");
    }, ...args);
});

connectionRouter.post("/review/:status/:requestId", userAuth, (...args) => {
    apiHandler(async (req, res) => {
        const loggedUser = req.loggedUser;
        if (loggedUser) {
            const loggedUserId = loggedUser._id;
            const { requestId = "", status = "" } = req.params || {};
            if (!loggedUserId || !requestId.trim() || !status.trim()) return sendErrorResp(res, 400, "missing status or request id");
            if (![STATUS_ACCEPTED, STATUS_REJECTED].includes(status)) return sendErrorResp(res, 400, status + " is not allowed");

            // finding connection with the given requestId and the receiver is the loggedUserId and status should be interested
            const connectionObj = await ConnectionsModel.findOne({ _id: requestId, toUserId: loggedUserId, status: STATUS_INTERESTED });
            if (!connectionObj) return sendErrorResp(res, 400, "bad connection");

            connectionObj.status = status;
            await connectionObj.save();

            return sendResp(res, "connection " + status + " successfully");
        } else return sendErrorResp(res, 404, "user not found");
    }, ...args);
});


export default connectionRouter;
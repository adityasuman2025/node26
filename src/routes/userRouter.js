import { Router } from "express";
import UsersModel from "../models/usersModel.js";
import ConnectionsModel, { STATUS_ACCEPTED, STATUS_INTERESTED } from "../models/connectionsModel.js";
import { userAuth } from "../middlewares/auth.js";
import { apiHandler, sendErrorResp, sendResp } from "../utils/index.js";
import { ALLOWED_USER_FIELDS } from "../constants.js"

const userRouter = Router();

// get logged user's pending connection requests
userRouter.get("/requests", userAuth, (...args) => {
    apiHandler(async (req, res) => {
        const loggedUser = req.loggedUser;
        if (loggedUser) {
            const loggedUserId = loggedUser._id;
            if (!loggedUserId) return sendErrorResp(res, 404, "user not found");

            const connections = await ConnectionsModel.find({ toUserId: loggedUserId, status: STATUS_INTERESTED }).populate("fromUserId", ALLOWED_USER_FIELDS);
            sendResp(res, connections);

        } else return sendErrorResp(res, 404, "user not found");
    }, ...args)
});

// get logged user's connections
userRouter.get("/connections", userAuth, (...args) => {
    apiHandler(async (req, res) => {
        const loggedUser = req.loggedUser;
        if (loggedUser) {
            const loggedUserId = loggedUser._id;
            if (!loggedUserId) return sendErrorResp(res, 404, "user not found");

            const connections = await ConnectionsModel.find({
                $or: [{ toUserId: loggedUserId, status: STATUS_ACCEPTED }, { fromUserId: loggedUserId, status: STATUS_ACCEPTED }]
            }).populate("fromUserId", ALLOWED_USER_FIELDS).populate("toUserId", ALLOWED_USER_FIELDS);

            const data = connections.map(item => item.fromUserId._id.toString() === loggedUserId.toString() ? item.toUserId : item.fromUserId)
            sendResp(res, data);

        } else return sendErrorResp(res, 404, "user not found");
    }, ...args)
});

/*
    tl;dr: get list of other users who are not connected to the logged user (except when the other user has marked the logged user Interested)

    I want to build feed of tinder, where logic is
    1. I will not see my own profile
    2. if I already have a relation (accepted, rejected, ignored) then I will not get his profile in my feed
    3. if he has marked my profile as interested then I can get his profile in my feed, so that if I also like him and marked (accept his request) -> it will be a match

    SELECT * FROM users WHERE _id NOT IN (
        SELECT fromUserId FROM connections WHERE toUserId = loggedUserId AND status IN ('Accepted', 'Rejected', 'Ignored')
        UNION
        SELECT toUserId FROM connections WHERE fromUserId = loggedUserId AND status IN ('Accepted', 'Rejected', 'Ignored', 'Interested')
    ) AND _id != loggedUserId
 */
userRouter.get("/feed", userAuth, (...args) => {
    apiHandler(async (req, res) => {
        const loggedUser = req.loggedUser;
        if (loggedUser) {
            const page = Number(req.query.page) || 1;
            let limit = Number(req.query.limit) || 10;
            limit = limit > 50 ? 50 : limit;

            const loggedUserId = loggedUser._id;
            if (!loggedUserId) return sendErrorResp(res, 404, "user not found");

            // getting all the other userIds, with whom the logged user is connected except when the other user is interested in logged user's profile
            const alreadyExistingConnections = await ConnectionsModel.find({
                $or: [{ fromUserId: loggedUserId }, { toUserId: loggedUserId, status: { $not: { $in: [STATUS_INTERESTED] } } }]
            });
            const alreadyExistingConnectionsUserIds = alreadyExistingConnections.map((item) => item.fromUserId.toString() === loggedUserId.toString() ? item.toUserId : item.fromUserId);

            // finding users whose id is not in alreadyExistingConnections
            const query = {
                $and: [
                    { _id: { $nin: alreadyExistingConnectionsUserIds } }, // $nin is not it i.e. $not: {$in: values[]}
                    { _id: { $ne: loggedUserId } } // logged user should not get his own profile
                ]
            };
            const connections = await UsersModel.find(query).skip((page - 1) * limit).limit(limit).select(ALLOWED_USER_FIELDS);
            const total = await UsersModel.countDocuments(query);

            sendResp(res, connections, { page, limit, total });
        } else return sendErrorResp(res, 404, "user not found");
    }, ...args)
});

export default userRouter;
import { Schema, model, MongooseError } from "mongoose";

export const STATUS_INTERESTED = "Interested";
export const STATUS_IGNORED = "Ignored";
export const STATUS_ACCEPTED = "Accepted";
export const STATUS_REJECTED = "Rejected";

const connectionsSchema = new Schema({
    fromUserId: {
        type: Schema.Types.ObjectId,
        ref: "users", // reference to the users collections
        required: [true, "from is required"],
        cast: "invalid from user id", // when type does not match then this error message will go
    },
    toUserId: {
        type: Schema.Types.ObjectId,
        ref: "users", // reference to the users collections
        required: [true, "to is required"],
        cast: "invalid to user id", // when type does not match then this error message will go
    },
    status: {
        type: String,
        trim: true,
        required: [true, "status is required"],
        enum: {
            values: [STATUS_INTERESTED, STATUS_IGNORED, STATUS_ACCEPTED, STATUS_REJECTED],
            message: "{VALUE} is not a valid connection status"
        }
    }
}, { timestamps: true });

connectionsSchema.index({ fromUserId: 1, toUserId: 1 }); // doing combined index on fromUserId + toUserId (compound index) on "connections" collection

connectionsSchema.pre("save", function() {
    const connection = this;

    if (connection.fromUserId.toString() === connection.toUserId.toString()) throw new MongooseError("can't make connection with itself");
});

const ConnectionsModel = model("connections", connectionsSchema);
export default ConnectionsModel;
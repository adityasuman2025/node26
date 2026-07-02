import { Schema, model } from "mongoose";

const userSchema = new Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    address: {
        type: String,
    },
    gender: {
        type: String,
    },
    // skills: {
    //     type: [String],
    // }
});

const UsersModel = model("users", userSchema);
export default UsersModel;
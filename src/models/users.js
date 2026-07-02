import { Schema, model } from "mongoose";
import validator from "validator";

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        minLength: [3, "Name is too short"],
        maxLength: [100, "Name is too long"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        lowercase: true,
        unique: [true, "Email is already taken"],
        immutable: true, // email will not get updated silently, i.e. will not throw any error
        validate: function(value) {
            if (!validator.isEmail(value)) throw new Error("Not a valid email")
        }
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        trim: true,
        validate: function(value) {
            if (!validator.isStrongPassword(value)) throw new Error("Not a strong email")
        }
    },
    address: {
        type: String,
        trim: true,
        maxLength: [100, "Address is too long"],
    },
    gender: {
        type: String,
        trim: true,
        enum: {
            values: ["Male", "Female", "Others"],
            message: "{VALUE} is not a valid gender options"
        }
    },
    age: {
        type: Number,
        min: 18,
        trim: true,
    },
    profilePic: {
        type: String,
        trim: true,
        default: "https://static.vecteezy.com/system/resources/thumbnails/005/544/718/small/profile-icon-design-free-vector.jpg",
        validate: function(value) {
            if (!validator.isURL(value)) throw new Error("Not a valid profile pic url")
        }
    },
    skills: {
        type: [String],
        validate: function(value) {
            if (value.length > 20) throw new Error("Too many skills");

            for (let i = 0; i < value.length; i++) {
                const skill = value[i];
                if (skill.length > 50) throw new Error("Too many skills");
            }
        }
    }
}, { timestamps: true });

const UsersModel = model("users", userSchema);
export default UsersModel;
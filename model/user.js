import mongoose from "mongoose";
import Collections from "../database/collections.js";

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    _id: {
        type: String
    }
})

const usersModel = mongoose.model(Collections.users, userSchema)

export default usersModel
import mongoose from "mongoose";
import Collections from "../database/collections.js";

const postSchema = new mongoose.Schema({
    userID: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
})

const postsModel = mongoose.model(Collections.posts, postSchema)

export default postsModel
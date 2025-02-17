import { model, Schema } from "mongoose";

import Blacklist from "./blacklist.interface";

const blacklistSchema = new Schema({
    token: {
        type: String,
        required: true,
        ref: "User"
    }
}, {timestamps: true});

const blacklistModel = model<Blacklist & Document>("Blacklist", blacklistSchema);

export default blacklistModel;
import { model, Schema } from "mongoose";
import User from "./user.interface";

const addressSchema = new Schema({
    city: String,
    street: String,
});

const userSchema = new Schema({
    address: addressSchema,
    email: String,
    name: String,
    password: String,
});

const userModel = model<User & Document>('User', userSchema);

export default userModel;
import { model, Schema } from "mongoose";
import User from "./user.interface";

const addressSchema = new Schema({
    city: String,
    street: String,
    country: String,
});

const userSchema = new Schema({
    address: addressSchema,
    email: String,
    name: String,
    password: String,
    twoFactorAuthenticationSecret: String,
    isTwoFactorAuthenticationEnabled: { type: Boolean, default: false },
});

const userModel = model<User & Document>('User', userSchema);

export default userModel;

export type UserDocument = User & Document;
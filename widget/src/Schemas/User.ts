import { Schema, model } from "mongoose"

const UserSchema = new Schema({
    id: { type: Number, unique: true },
    token_type: { type: String },
    expires_in: { type: Number },
    access_token: { type: String },
    refresh_token: { type: String },
    subdomain: { type: String },
    authorization_code: { type: String }
}, { timestamps: true })

export default model("User", UserSchema)

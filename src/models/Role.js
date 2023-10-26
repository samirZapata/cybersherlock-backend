import {Schema, model} from "mongoose";

//SE GUARDA CADA ROL EN UNA COLECCION

export const ROLES = ["user", "admin"];

const roleSchema = new Schema({
    name: String,
},{
    versionKey: false
});

export default model("Role", roleSchema);
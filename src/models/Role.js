import {Schema, model} from "mongoose";

//SE GUARDA CADA ROL EN UNA COLECCION

const roleSchema = new Schema({
    name: String,
},{
    versionKey: false
});

export default model("Role", roleSchema);
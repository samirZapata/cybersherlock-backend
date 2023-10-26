import {Schema, model} from "mongoose";

const caseSchema = new Schema({
    nombreCaso: String,
    acosador: String,
    telAcosador: String,
    desc: String,
},{
    timestamps: true,
    versionKey: false
});


export default model("Case", caseSchema);
import { Schema, model } from "mongoose";

const caseSchema = new Schema(
  {
    nombreC
    aso: String,
    acosador: String,
    telAcosador: String,
    desc: String,
    Evidencias: [{ type: Schema.Types.ObjectId, ref: "Evidencia" }],
    userId:{
      type: Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default model("Case", caseSchema);
import { Schema, model, models } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new Schema(
  {
    nombre: {
      type: String,
      required: true,
    },
    edad: Number,
    correo: {
      type: String,
      unique: true,
      required: true,
    },
    genero: String,
    dni: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },

    roles: [
      {
        ref: "Role",
        type: Schema.Types.ObjectId,
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

//METODOS PARA CIFRAR Y COMPARAR CONTRASEÑAS
userSchema.statics.encryptPassword = async (password) => {
  try{

    const salt = await bcrypt.genSalt(10); //10 es el numero de veces que se va a cifrar
    const hashedPassword = await bcrypt.hash(password, salt); //cifra la contraseña
    console.log('Contraseña cifrada: ', hashedPassword)
    return hashedPassword;
  }catch(e){
    console.log(e);
  }
};

userSchema.statics.comparePassword = async (password, recivedPassword) => {
  return await bcrypt.compare(password, recivedPassword); //compara la contraseña cifrada con la que se recibe
}


export default model("User", userSchema);

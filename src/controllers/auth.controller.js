import User from "../models/users";
import jwt from "jsonwebtoken";
import config from "../config";
import Role from "../models/Role";
import * as nodemailer from "nodemailer";
import bcrypt from 'bcryptjs'

//REGISTRARSE
export const singUp = async (req, res) => {
  const { nombre, edad, correo, genero, dni, password, roles } = req.body;

  const newUser = new User({
    nombre,
    edad,
    correo,
    genero,
    dni,
    password: await User.encryptPassword(password),
  });

  //SI SE RECIBEN ROLES
  if (roles) {
    const foundRole = await Role.find({ name: { $in: roles } });
    newUser.roles = foundRole.map((role) => role.dni); //CREA UN ARREGLO DE DNI DE CADA USUARIO
  } else {
    const role = await Role.findOne({ name: "user" });
    newUser.roles = [role._id];
  }

  const savedUser = await newUser.save();
  console.log(savedUser);

  //CREAR TOKEN PARA CADA USUARIO
  const token = jwt.sign({ id: savedUser.dni }, config.SECRET, {
    expiresIn: 86400, //24 horas
  });
  res.json({ token });
};

//LOGEARSE
export const singIn = async (req, res) => {
  //OBTENEMOS LOS DATOS DEL USUARIO

  const userFound = await User.findOne({ correo: req.body.correo }).populate(
    "roles"
  );

  if (!userFound) {
    return res.status(400).json({ message: "Usuario no encontrado" });
  }

  const matchPassword = await User.comparePassword(
    req.body.password,
    userFound.password
  ); //COMPARA LA CONTRASEÑA CIFRADA CON LA QUE SE RECIBE
  if (!matchPassword)
    return res
      .status(401)
      .json({ token: null, message: "Contraseña incorrecta" });

  const token = jwt.sign({ id: userFound.dni }, config.SECRET, {
    expiresIn: 86400, //24 horas
  });

  res.json(token);
};

//OBTENER USUARIO POR DNI
export const getUserByDni = async (req, res) => {
  const user = await User.findOne({ dni: req.params.dni }).populate("roles");
  console.log(user);
  res.status(200).json(user);
};

//ACTUALIZAR USUARIO POR DNI

export const updateUserByDni = async (req, res) => {
  const updateUser = await User.findByIdAndUpdate(rq.param._id, req.body, {
    new: true,
  });
  res.status(200).json(updateUser);
};

//ELIMINAR USUARIO POR DNI
export const deleteUserByDni = async (req, res) => {
  const { dni } = req.params.dni;
  await User.findOneAndDelete(dni);
  res.status(200).json("Eliminado");
};



//RESETEAR CONTRASEÑA
export const resetPassword = async (req, res) => {
  const email = req.params.correo;
  const user = await User.findOne({ correo: email });

  if (user) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "zapatasami5@gmail.com",
        pass: "zhdvprirnkcwzoww",
      },
    });

    //SE GENERA EL CODIGO DE VERIFICACION TEMPORAL
    const tempCode = Math.floor(Math.random() * 90000) + 10000;
    user.tempCode = tempCode;
    user.tempCodeExpires = Date.now() + 1500000; //15 minutos
    await user.save();

    //SE ENVIA EL CODIGO DE VERIFICACION AL CORREO DEL USUARIO
    const mailOptions = {
      from: "zapatasami5@gmail.com",
      to: email,
      subject: "Codigo de verificacion",
      text: `Su codigo de verificacion es: ${tempCode}`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
        res.status(500).json({ message: "Error al enviar el correo" });
      } else {
        console.log("Email enviado:" + info.response);
      }
    });
  } else {
    return res.status(400).json({ message: "Usuario no encontrado" });
  }
};


//VERIFICAR CODIGO
export const verificarCodigo = async (req, res) => {
  const {correo} = req.body;
  const tempCodigo = req.params.tempCode
  const user = await User.findOne({ tempCode: tempCodigo });

  if ( user.tempCode === tempCodigo) {
    res.status(200).json({ message: "Codigo correcto" });
  } else {
    res.status(400).json({ message: "Codigo incorrecto" });
  }
};



//CAMBIAR CONTRASEÑA
export const updatePass = async (req, res) => {
  const { correo, newPassword } = req.body;
  const user = await User.findOne({ correo: correo });

  if (user) {
      
      user.password = await User.encryptPassword(newPassword);
      await user.save();
      res.status(200).json({ message: "Contraseña cambiada" }); 
      
  } else {
    res.status(400).json({ message: "Usuario no encontrado" });
  }
};

//EN ESTE ARCHIVO CONFIRMAMOS SI EL USUARIO NOS ESTA ENVIANDO SU TOKEN RESPECTIVAMENTE: ARCHIVO DE ARUTORIZACION
import jwt from "jsonwebtoken";
import config from "../config";
import User from "../models/users";

//FUNCION PARA VERIFICAR SI ESTOY ENVIANDO UN TOKEN
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers["x-access-token"];

    if (!token) {
      return res.status(403).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, config.SECRET);
    req.dni = decoded.dni;

    const user = await User.findById(req.dni, { password: 0 });

    if (!user) {
      return res.status(404).json({ message: "No user found" });
    }
    console.log(user);

    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

import User from '../models/users';
import jwt from 'jsonwebtoken';
import config from '../config';
import Role from '../models/Role';

export const singUp = async (req, res) => {
    
    const {nombre, edad, correo, genero, dni, password, roles} = req.body;

    const newUser = new User({
        nombre, 
        edad, 
        correo, 
        genero, 
        dni, 
        password: await User.encryptPassword(password)
    });

    //SI SE RECIBEN ROLES
    if(roles){
        const foundRole = await Role.find({name: {$in: roles}})
        newUser.roles = foundRole.map(role => role.dni); //CREA UN ARREGLO DE DNI DE CADA USUARIO
    }else{
        const role = await Role.findOne({name: "user"});
        newUser.roles = [role._id];
    }

    const savedUser = await newUser.save();
    console.log(savedUser);

    //CREAR TOKEN PARA CADA USUARIO
    const token = jwt.sign({id: savedUser.dni}, config.SECRET, {
        expiresIn: 86400 //24 horas
    })
    res.json({token})
}

export const singIn = async (req, res) => {
    //OBTENEMOS LOS DATOS DEL USUARIO

   const userFound = await User.findOne({correo: req.body.correo}).populate("roles");

   if(!userFound){
    return res.status(400).json({message: "Usuario no encontrado"})
   }

   const matchPassword = await User.comparePassword(req.body.password, userFound.password); //COMPARA LA CONTRASEÑA CIFRADA CON LA QUE SE RECIBE
   if(!matchPassword) return res.status(401).json({token: null, message: "Contraseña incorrecta"});

   
}
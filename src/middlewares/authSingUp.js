//ARCHIVO PARA VERIFICAR SI YA EXISTE EL USUARIO
import {ROLES} from '../models/Role';
import User from '../models/users';
import { Jwt } from 'jsonwebtoken';
import token from '../models/Token.model';
import sendEmail from '../libs/sendEmail';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';


export const checkDuplicateUsers = async (req, res, next) => {
    const user = await User.findOne({correo: req.body.correo})

    if(user) return res.status(200).json('El usuario ya existe')
    next()
}


//VALIDAMOS SI EL ROL EXISTE
export const checkRolesExisted = (req, res, next) => {
    if(req.body.roles){
        for(let i=0; i<=req.body.roles.length; i++){
            if(!ROLES.includes(req.body.roles[i])){
                return res.status(400).json(`El rol ${req.body.roles[i]} no existe`)
            }
        }
    }
    next()
}


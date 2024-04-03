import jwt from 'jsonwebtoken';
require('dotenv').config();
import { expressjwt } from 'express-jwt';

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403); // Forbidden
    }

    req.user = user;
    next();
  });
}



// Clave secreta para firmar los tokens JWT
const secretKey = 'secret';

// Middleware para autenticar al usuario con JWT
exports.authenticateUser = expressjwt({ secret: secretKey, algorithms: ['HS256'] });

// Middleware para obtener el correo electrónico del usuario autenticado
exports.getUserEmail = (req, res, next) => {
  if (req.user) {
    req.userEmail = req.user.email; // Asigna el correo electrónico del usuario a req.userEmail
  }
  next();
};


module.exports = verifyToken;
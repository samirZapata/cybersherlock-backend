import { Router } from "express";
const router = Router();

import * as authCtrl from "../controllers/auth.controller";
import {checkDuplicateUsers} from '../middlewares/authSingUp';

router.post('/singup', checkDuplicateUsers ,authCtrl.singUp)
router.post('/singin', authCtrl.singIn)
router.get('/:dni', authCtrl.getUserByDni)
router.put('/:dni', authCtrl.updateUserByDni)
router.delete('/:dni', authCtrl.deleteUserByDni)

router.post('/resetPassword/:correo', authCtrl.resetPassword)
router.post('/verificarCodigo/:tempCode', authCtrl.verificarCodigo)
router.post('/updatePass', authCtrl.updatePass)



export default router;
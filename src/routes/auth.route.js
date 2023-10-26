import { Router } from "express";
const router = Router();

import * as authCtrl from "../controllers/auth.controller";
import {checkDuplicateUsers} from '../middlewares/authSingUp';

router.post('/singup', checkDuplicateUsers ,authCtrl.singUp)
router.post('/singin', authCtrl.singIn)



export default router;
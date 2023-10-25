import { Router } from "express";
const router = Router();

import * as authCtrl from "../controllers/auth.controller";

router.post('/singup', authCtrl.singUp)
router.post('/singin', authCtrl.singIn)



export default router;
import { Router } from "express";
const router = Router();
import express from 'express';
import * as caseAuxController from '../controllers/cases.controller';
import { verifyToken } from '../middlewares';
import multer from 'multer';

//CASE ROUTES
router.get('/:createdBy', caseAuxController.getByMail);

export default router;
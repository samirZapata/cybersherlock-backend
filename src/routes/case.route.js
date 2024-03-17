import { Router } from "express";
const router = Router();
import express from 'express';
import * as caseController from '../controllers/cases.controller';
import { verifyToken } from '../middlewares';
import multer from 'multer';

//CASE ROUTES

router.post('/', caseController.createCase);
router.get('/:correo', caseController.getCasesByEmail);
router.put('/:caseId', verifyToken, caseController.updateCase);
router.delete('/:caseId', verifyToken, caseController.deleteCase);


//Multer para manejar el middleware de subida de archivos
export const upload = multer({ dest: './uploads/' }).single('file');
router.post('/upload', (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err);
    } else if (err) {
      return res.status(500).json(err);
    }
    next();
  });
}, caseController.uploadFile);


/*
router.post("/", caseController.createCase);
router.get("/", caseController.getCase);
router.get("/:caseId", caseController.getCaseById);
router.put("/:caseId", caseController.updateCase);
router.delete("/:caseId", caseController.deleteCase);
router.post("/:upload", caseController.uploadFile);
**/
export default router;

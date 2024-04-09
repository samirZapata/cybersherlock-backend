import { Router } from "express";
const router = Router();
import express from 'express';
import * as caseController from '../controllers/cases.controller';
import { verifyToken } from '../middlewares';
import multer from 'multer';

//CASE ROUTES
router.post('/', caseController.createCase);
router.get('/:nombreCaso', caseController.getCaseByNombreCaso);
router.put('/:caseId', verifyToken, caseController.updateCase);
router.delete('/:caseId', verifyToken, caseController.deleteCase);
router.get('/uploads/:casoId/:nombreArchivo', caseController.getFileByNombreArchivo);



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


export default router;

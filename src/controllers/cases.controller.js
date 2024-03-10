import multer from 'multer'
import Case from '../models/Cases'
import fs from 'fs'
import path from 'path'

//DEFINIR STORAGE ENGINE PARA MULTER
const storage = multer.memoryStorage();
const upload = multer({ storage });

export const createCase = async (req, res) => {
  const uploadMiddleware = upload.fields([{ name: 'evidencias', maxCount: 10 }]);

  return uploadMiddleware(req, res, async () => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send('No files were uploaded.');
    }

    const { nombreCaso, acosador, telAcosador, desc } = req.body;
    const newCase = new Case({
      nombreCaso,
      acosador,
      telAcosador,
      desc,
      Evidencias: [],
    });

    // Guardar registro en la base de datos
    const caseSaved = await newCase.save();

    // Extraer archivos y guardarlos en disco
    let evidencePaths = [];
    for (let i = 0; i < req.files.evidences.length; i++) {
      const file = req.files.evidences[i];
      const directoryPath = './uploads/' + caseSaved._id;
      if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath);
      }
      const filePath = path.join(directoryPath, file.originalname);
      fs.writeFileSync(filePath, file.buffer);
      evidencePaths.push(filePath);
    }

    // Asociar ruta de archivos al caso
    caseSaved.Evidencias = caseSaved.Evidencias.concat(evidencePaths);
    await caseSaved.save();

    res.status(201).json(caseSaved);
  });
};

export const getCase = async (req, res) => {
    const cases = await Case.find()
    res.json(cases)
}

export const getCaseById = async (req, res) => {
    const casos = await Case.findById(req.params.caseId)
    res.status(200).json(casos)
}

export const updateCase = async (req, res) => {
    const updatedCase = await Case.findByIdAndUpdate(req.params.caseId, req.body, {
        new: true
    })
    res.status(200).json(updatedCase)
}

export const deleteCase = async (req, res) => {
    await Case.findByIdAndDelete(req.params.caseId)
    res.status(200).json('Eliminado')
}

export const uploadFile = async (req, res) => {
    
}


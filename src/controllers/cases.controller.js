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
    const { _id: userId } = req.user; // Obtenemos el ID de usuario autenticado

    const newCase = new Case({
      nombreCaso,
      acosador,
      telAcosador,
      desc,
      Evidencias: [],
      userId, // Agregamos el ID de usuario al caso
      createdBy: req.user.correo, // Agregamos el correo electrónico del usuario al caso
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

/**
 * 
 * Utilizo req.query.email para obtener el correo electrónico de la URL. Luego, busco el caso con el correo electrónico y utilizo 
 * populate para recuperar los detalles del usuario relacionado. Devuelves el caso encontrado en la respuesta.
 */
// Get cases by email
export const getCasesByEmail = async (req, res) => {
  try {
    const email = req.query.email;
    const casos = await Case.find({ "user.email": email });
    if (casos.length === 0) {
      return res.status(404).json({ message: "No cases found for this email." });
    }
    res.status(200).json(casos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error." });
  }
};


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



/*
Esta función procesa cada archivo subido en req.files.evidencias y los guarda en la carpeta uploads con un nombre único. 
Ahora, cuando se use la ruta POST /api/cases/:caseId/upload en Android, Multer gestionará los archivos y 
llamará a la función uploadFile en cases.controller.js para procesarlos y guardarlos en el servidor.
*/

exports.uploadFile = async (req, res, next) => {
  try {
    const uploadFolder = 'uploads/';

    // Create upload folder if it doesn't exist
    await fs.ensureDir(uploadFolder);

    // Process each file and save to the server
    req.files.evidencias.forEach(file => {
      // Generate unique filename with timestamp and original extention
      const now = Date.now();
      const uniqueName = `${now}_${file.originalname}`;

      // Construct destination path
      const targetPath = path.resolve(__dirname, `../../${uploadFolder}${uniqueName}`);

      // Save file to disk
      fs.move(file.path, targetPath, err => {
        if (err) {
          console.error(`Error moving file ${file.originalname}:`, err);
          return res.status(500).send('An error occurred while saving the files.');
        }
        console.log(`Successfully moved file ${file.originalname} to ${targetPath}`);
      });
    });

    // Call the next middleware or route handler
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).send('An unexpected error occured during file processing.');
  }
};

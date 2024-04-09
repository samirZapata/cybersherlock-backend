import multer from "multer";
import Case from "../models/Cases";
import fs from "fs";
import path from "path";
import Evidencia from "../models/Evidencias";
import {
  create
} from "domain";
import crypto from "crypto";
import * as MagicNumber from "magic-number";
import Cases from "../models/Cases";



/*
Funciones de cifrado y descifrado:
Las funciones cifrarArchivo y descifrarArchivo utilizan el algoritmo de cifrado simétrico AES-256 en modo CBC 
(Cipher Block Chaining) para cifrar y descifrar los archivos. Estas funciones toman como entrada el archivo 
(representado como un búfer de datos) y una clave de cifrado, y devuelven el archivo cifrado o descifrado, respectivamente.

Creación de la clave de cifrado:
Antes de cifrar un archivo, se genera una clave de cifrado aleatoria utilizando crypto.randomBytes(32), 
que produce una cadena de 32 bytes (256 bits), que se utiliza como clave de cifrado AES-256.

Cifrado del archivo:
Después de generar la clave de cifrado, el archivo se cifra utilizando la función cifrarArchivo, 
que utiliza la clave generada y el algoritmo AES-256-CBC para cifrar el archivo. El archivo cifrado 
se guarda en disco utilizando fs.writeFileSync.

Verificación del cifrado:
Después de cifrar el archivo, el código intenta detectar si el archivo está cifrado utilizando la biblioteca MagicNumber. 
Si el formato del archivo es reconocido como cifrado (por ejemplo, si es un archivo ZIP cifrado), 
se imprime un mensaje indicando que el archivo está cifrado.

Almacenamiento de la clave de cifrado:
La clave de cifrado utilizada para cifrar el archivo se almacena en el modelo Case como claveDeCifrado.
*/


// DEFINIR STORAGE ENGINE PARA MULTER
const storage = multer.memoryStorage();
const upload = multer({
  storage
});

// Función para cifrar un archivo usando AES-256
function cifrarArchivo(archivo, clave) {
  const cipher = crypto.createCipheriv("aes-256-cbc", clave, Buffer.alloc(16));
  let encrypted = Buffer.concat([cipher.update(archivo), cipher.final()]);
  return encrypted;
}

// Función para descifrar un archivo usando AES-256
function descifrarArchivo(archivoCifrado, clave) {
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    clave,
    Buffer.alloc(16)
  );
  let decrypted = Buffer.concat([
    decipher.update(archivoCifrado),
    decipher.final(),
  ]);
  return decrypted;
}

export const createCase = async (req, res) => {
  const uploadMiddleware = upload.fields([{
    name: "evidencias",
    maxCount: 10
  }, ]);

  uploadMiddleware(req, res, async (err) => {
    if (err) {
      return res.status(400).send("Error al cargar los archivos");
    }

    if (!req.files || !req.files.evidencias) {
      return res.status(400).send("No se cargaron archivos");
    }

    const {
      nombreCaso,
      acosador,
      telAcosador,
      desc,
      createdBy
    } = req.body;


    let claveDeCifrado;

    // Crear un nuevo caso
    const newCase = new Case({
      nombreCaso,
      acosador,
      telAcosador,
      desc,
      createdBy,
      Evidencias: [],
    });

    try {
      // Guardar el caso en la base de datos
      const caseSaved = await newCase.save();

      // Procesar los archivos cargados
      const evidenciaPromises = req.files.evidencias.map(async (file) => {
        const directoryPath = `./uploads/${caseSaved._id}`;
        const filePath = path.join(directoryPath, file.originalname);

        // Crear el directorio si no existe
        if (!fs.existsSync(directoryPath)) {
          fs.mkdirSync(directoryPath, {
            recursive: true
          });
        }

        claveDeCifrado = crypto.randomBytes(32); // 32 bytes = 256 bits para AES-256
        console.log(
          `Clave de cifrado para ${file.originalname
          }: ${claveDeCifrado.toString("hex")}`
        );

        // Cifrar el archivo antes de guardar
        const archivoCifrado = cifrarArchivo(file.buffer, claveDeCifrado);

        // Guardar el archivo cifrado en disco
        fs.writeFileSync(filePath, archivoCifrado);

        // COMPROBAR SI EL ARCHIVO ESTÁ CIFRADO
        MagicNumber.detectFile(file.Buffer, (err, result) => {
          if (err) {
            console.error("Error al detectar la firma del archivo:", err);
            return;
          } else if (result) {
            const format = result.format;
            console.log(`Formato del archivo: ${format}`);

            // Comprobar si el archivo está cifrado
            switch (format) {
              case "gpg":
              case "pgp":
                console.log("El archivo está cifrado con GPG o PGP.");
                break;
              case "zip":
                // Leer la firma del archivo ZIP para determinar si está cifrado
                const view = new DataView(file.buffer.buffer);
                const centralDirectoryLocation = file.buffer.readUInt32BE(
                file.buffer.byteLength - 20
                );

                /*Si el valor leído no es igual a 1, la expresión (generalPurposeBitFlag & 0x0001) === 0x0001 será false. 
                Esto podría suceder si el valor almacenado en esa posición no tiene el bit menos significativo establecido en 1, 
                lo que significa que el archivo ZIP no está cifrado.*/
                
                const generalPurposeBitFlag = view.getUint16(
                  centralDirectoryLocation - 2,
                  false
                );
                if ((generalPurposeBitFlag & 0x0001) === 0x0001) {
                  console.log("El archivo ZIP está cifrado.");
                } else {
                  console.log("El archivo ZIP no está cifrado.");
                }
                break;
              default:
                console.log(
                  "El formato del archivo no indica si está cifrado o no."
                );
            }
          } else {
            console.log("No se pudo detectar la firma del archivo.");
          }
        });

        // Crear una nueva instancia de Evidencia y asociarla con el caso
        const evidencia = new Evidencia({
          filename: file.originalname,
          path: filePath,
          size: archivoCifrado.length, // Tamaño del archivo cifrado
          case: caseSaved._id,
          claveDeCifrado: claveDeCifrado.toString("hex"),
        });

        // Guardar la evidencia en la base de datos
        const evidenciaSaved = await evidencia.save();

        // Agregar la referencia de la evidencia al caso
        caseSaved.Evidencias.push(evidenciaSaved._id);

        return evidenciaSaved;
      });

      // Esperar a que se procesen todas las evidencias
      await Promise.all(evidenciaPromises);

      // Guardar los cambios en el caso
      await caseSaved.save();

      res.status(201).json(caseSaved);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error al crear el caso");
    }
  });
};





export const getCaseByNombreCaso = async (req, res) => {
  try {
    // Buscar el caso por nombre
    const caso = await Case.findOne({ nombreCaso: req.params.nombreCaso });

    if (!caso) {
      return res.status(404).json({ message: "Caso no encontrado" });
    }

    // Buscar el archivo adjunto asociado al caso
    const evidencias = await Evidencia.find({ case: caso._id });

    if (!evidencias) {
      return res.status(404).json({ message: "No se encontraron evidencias para este caso" });
    }

    // Recolectar las claves de cifrado de cada archivo
    const clavesCifrado = evidencias.map(evidencia => {
      return { filename: evidencia.filename, claveCifrado: evidencia.claveDeCifrado };
    });

    // Devolver la información del caso, archivos adjuntos y claves de cifrado
    res.status(200).json({ caso, evidencias, clavesCifrado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al buscar el caso" });
  }
};


export const getFileByNombreArchivo = async (req, res) => {
  const casoId = req.params.casoId;
  const nombreArchivo = req.params.nombreArchivo;
  
  // Construir la ruta de archivos cifrados
  const rutaArchivosCifrados = path.join(__dirname, '../../uploads', casoId, nombreArchivo);

  try {
    // Verificar si el archivo existe
    const stats = fs.statSync(rutaArchivosCifrados);
    
    // Si es un archivo, descargarlo
    if (stats.isFile()) {
      return res.download(rutaArchivosCifrados, nombreArchivo);
    } else {
      return res.status(404).send(`El archivo '${nombreArchivo}' no se encontró en el caso con ID '${casoId}'.`);
    }
  } catch (error) {
    // Manejar errores
    console.error(error);
    return res.status(500).send('Error al descargar el archivo.');
  }
}



export const getCase = async (req, res) => {
  const cases = await Case.find();
  res.json(cases);
};

export const getCaseById = async (req, res) => {
  const casos = await Case.findOne(req.params.nombreCaso);
  res.status(200).json(casos);
};


export const updateCase = async (req, res) => {
  const updatedCase = await Case.findByIdAndUpdate(
    req.params.caseId,
    req.body, {
      new: true,
    }
  );
  res.status(200).json(updatedCase);
};

export const deleteCase = async (req, res) => {
  await Case.findByIdAndDelete(req.params.caseId);
  res.status(200).json("Eliminado");
};

/*
Esta función procesa cada archivo subido en req.files.evidencias y los guarda en la carpeta uploads con un nombre único. 
Ahora, cuando se use la ruta POST /api/cases/:caseId/upload en Android, Multer gestionará los archivos y 
llamará a la función uploadFile en cases.controller.js para procesarlos y guardarlos en el servidor.
*/

exports.uploadFile = async (req, res, next) => {
  try {
    const uploadFolder = "uploads/";

    // Create upload folder if it doesn't exist
    await fs.ensureDir(uploadFolder);

    // Process each file and save to the server
    req.files.evidencias.forEach((file) => {
      // Generate unique filename with timestamp and original extention
      const now = Date.now();
      const uniqueName = `${now}_${file.originalname}`;

      // Construct destination path
      const targetPath = path.resolve(
        __dirname,
        `../../${uploadFolder}${uniqueName}`
      );

      // Save file to disk
      fs.move(file.path, targetPath, (err) => {
        if (err) {
          console.error(`Error moving file ${file.originalname}:`, err);
          return res
            .status(500)
            .send("An error occurred while saving the files.");
        }
        console.log(
          `Successfully moved file ${file.originalname} to ${targetPath}`
        );
      });
    });

    // Call the next middleware or route handler
    next();
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send("An unexpected error occured during file processing.");
  }
};


/**
 *
 * Utilizo req.query.email para obtener el correo electrónico de la URL. Luego, busco el caso con el correo electrónico y utilizo
 * populate para recuperar los detalles del usuario relacionado. Devuelves el caso encontrado en la respuesta.
 */
// Get cases by email
export const getByMail = async (req, res) => {
 
  try{
    //const casos = await Case.find({ createdBy: req.params.createdBy });

    const email = req.params.createdBy;
    console.log("Email:", email);
    
    const casos = await Case.find({ createdBy: email }).populate("createdBy");
    console.log("cases encontrados:", casos);

    console.log(casos);
    if (!casos) {
      return res
        .status(404)
        .json({
          message: "No cases found for this email."
        });
    }else{
      res.status(200).json(casos);
    }

  } catch (error) {
  
    console.error(error);

    if (error instanceof mongoose.Error.CastError) {
      return res.status(500).json({
        message: `Internal Server Error:\n\nCastError: Cast to ObjectId failed for value "${email}" at path "_id" for model "products"`
      });
    } else {
      res.status(500).json({
        message: `Internal Server Error.\n\n${error}`
      });
    }
  }
};
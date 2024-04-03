const mongoose = require('mongoose');

const evidenciaSchema = new mongoose.Schema({
  filename: { type: String, required: true, unique: true },
  path: { type: String, required: false },
  size: { type: Number, required: false },
  case: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Evidencia', evidenciaSchema);
const mongoose = require('mongoose');

const utilisateurSchema = mongoose.Schema({
  nom: { type: String },
  tel: { type: Number },
  email: { type: String, unique: true},
  password: { type: String },
  date: { type: Date },
});

module.exports = mongoose.model('Utilisateur', utilisateurSchema);
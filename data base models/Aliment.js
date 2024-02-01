const mongoose = require('mongoose');

const alimentSchema = mongoose.Schema({
  vagueId: { type: String },
  titre: { type: String },
  quantite: { type: Number },
  prix: { type: Number },
  fournisseur: { type: String },
  transport: { type: Number },
  facture: { type: String },
  date: { type: Date },
});

module.exports = mongoose.model('Aliment', alimentSchema);
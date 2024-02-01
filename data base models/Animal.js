const mongoose = require('mongoose');

const animalSchema = mongoose.Schema({
	vagueId: { type: String },
	titre: { type: String },
	quantite: { type: Number },
	prix: { type: Number },
	fournisseur: { type: String },
	transport: { type: Number },
	facture: { type: String },
	date: { type: Date },
});

module.exports = mongoose.model('Animal', animalSchema);
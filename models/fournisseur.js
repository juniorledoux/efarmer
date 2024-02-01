const mongoose = require('mongoose');
const uniqueValidator = require("mongoose-unique-validator");


const fournisseurSchema = mongoose.Schema({
	userId: { type: String },
	nom: { type: String, default: "Non spécifié" },
	score: { type: Number, default: 1 },
	type: { type: String },
	created_at: { type: Date },
});

//faire la verification des données
fournisseurSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Fournisseur', fournisseurSchema);
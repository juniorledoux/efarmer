const mongoose = require('mongoose');
const uniqueValidator = require("mongoose-unique-validator");


const utilisateurSchema = mongoose.Schema({
	nom: { type: String },
	tel: { type: Number, unique: true },
	email: { type: String, unique: true },
	password: { type: String },
	created_at: { type: Date },
});

//faire la verification des données
utilisateurSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Utilisateur', utilisateurSchema);
const mongoose = require('mongoose');
const uniqueValidator = require("mongoose-unique-validator");


const acheteurSchema = mongoose.Schema({
	nom: { type: String, default: "Non spécifié" },
	tel: { type: Number, default:0 },
});

//faire la verification des données
acheteurSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Acheteur', acheteurSchema);
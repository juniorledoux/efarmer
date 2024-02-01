const mongoose = require('mongoose');

const autre_depenseSchema = mongoose.Schema({
	vagueId: { type: String },
	titre: { type: String },
	prix: { type: Number },
	facture: { type: String },
	date: { type: Date },
});

module.exports = mongoose.model('Autres_depenses', autre_depenseSchema);
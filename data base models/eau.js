const mongoose = require('mongoose');

const eauSchema = mongoose.Schema({
	vagueId: { type: String },
	titre: { type: String },
	prix: { type: Number },
	facture: { type: String },
	date: { type: Date },
});

module.exports = mongoose.model('Eau', eauSchema);
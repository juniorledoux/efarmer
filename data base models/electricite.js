const mongoose = require('mongoose');

const electriciteSchema = mongoose.Schema({
	vagueId: { type: String },
	titre: { type: String },
	prix: { type: Number },
	facture: { type: String },
	date: { type: Date },
});

module.exports = mongoose.model('Electricite', electriciteSchema);
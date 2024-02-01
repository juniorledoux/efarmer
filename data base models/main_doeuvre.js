const mongoose = require('mongoose');

const main_doeuvreSchema = mongoose.Schema({
	vagueId: { type: String },
	titre: { type: String },
	prix: { type: Number },
	facture: { type: String },
	date: { type: Date },
});

module.exports = mongoose.model('Mains_doeuvre', main_doeuvreSchema);
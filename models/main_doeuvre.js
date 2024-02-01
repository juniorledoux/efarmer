const mongoose = require('mongoose');

const main_doeuvreSchema = mongoose.Schema({
	vagueId: { type: String },
	titre: { type: String },
	prix: { type: Number, default: 0 },
	coutParSujet: { type: Number, default: 0 },
	source_financementId: { type: String, default: "1111afe11f6111f11fce111c" },
	source_financement: { type: String, default: "Espèce" },
	facture: { type: String },
	created_at: { type: Date },
});

module.exports = mongoose.model('main_Doeuvre', main_doeuvreSchema);
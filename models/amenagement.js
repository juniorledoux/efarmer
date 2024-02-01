const mongoose = require('mongoose');

const amenagementSchema = mongoose.Schema({
	vagueId: { type: String },
	titre: { type: String },
	quantite: { type: Number, default: 0 },
	prix: { type: Number, default: 0 },
	coutParSujet: { type: Number, default: 0 },
	fournisseur: { type: String },
	fournisseurId: { type: String },
	source_financementId: { type: String, default: "1111afe11f6111f11fce111c" },
	source_financement: { type: String, default: "Espèce" },
	transport: { type: Number, default: 0 },
	facture: { type: String },
	created_at: { type: Date },
});


module.exports = mongoose.model('Amenagement', amenagementSchema);
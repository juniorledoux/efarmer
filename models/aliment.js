const mongoose = require("mongoose");

const alimentSchema = mongoose.Schema({
	vagueId: { type: String },
	titre: { type: String },
	quantite: { type: Number, default: 0 },
	prix: { type: Number, default: 0 },
	coutParSujet: { type: Number, default: 0 },
	poidsUnitaire: { type: Number, default: 0 },
	prixDuKg: { type: Number, default: 0 },
	fournisseur: { type: String },
	fournisseurId: { type: String },
	transport: { type: Number, default: 0 },
	qteUtilise: { type: Number, default: 0 },
	valeurQteUtilise: { type: Number, default: 0 },
	dateAchat: { type: Date },
	facture: { type: String },
	recyclage: { type: String, default: "non" },
	source_financementId: { type: String, default: "1111afe11f6111f11fce111c" },
	source_financement: { type: String, default: "Espèce" },
	utilisationId: { type: String },
	created_at: { type: Date },
});

module.exports = mongoose.model("Aliment", alimentSchema);

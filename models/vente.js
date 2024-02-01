const mongoose = require("mongoose");

const venteSchema = mongoose.Schema({
	vagueId: { type: String },
	qte_vendu: { type: Number, default: 0 },
	prix_vente: { type: Number, default: 0 },
	poids_total_vendu: { type: Number, default: 0 },
	mode_payement: { type: String, default: "Immédiat" },
	montant_avance: { type: Number, default: 0 },
	montant_restant: { type: Number, default: 0 },
	mode_encaissement: { type: String, default: "Espèces" },
	date_vente: { type: Date },
	acheteur: { type: String, default: "Non spécifié" },
	acheteurId: { type: String, default: "" },
	tel_acheteur: { type: Number, default: 0 },
	created_at: { type: Date },
});

module.exports = mongoose.model("Vente", venteSchema);

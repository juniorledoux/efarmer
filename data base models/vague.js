const mongoose = require("mongoose");

const vagueSchema = mongoose.Schema({
	userId: { type: String },
	fermeId: { type: String },
	titre: { type: String },
	qte_animaux: { type: Number },
	prix_animaux: { type: Number },
	fournisseur: { type: String },
	date_arrive: { type: Date },
	animaux_perdu: { type: Number },
	poids_animal_vente: { type: Number },
	prix_vente_animal: { type: Number },
	budget_prevu: { type: Number },
	benef_attendu: { type: Number },
	facture: { type: String },
});

module.exports = mongoose.model("Vague", vagueSchema);

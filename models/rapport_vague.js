const mongoose = require("mongoose");

const rapportVagueSchema = mongoose.Schema({
	vagueId: { type: String },

	total_depenses_animaux: { type: Number, default: 0 },
	total_depenses_aliments: { type: Number, default: 0 },
	total_depenses_soins_medicaux: { type: Number, default: 0 },
	total_depenses_amenagements: { type: Number, default: 0 },
	total_depenses_location_local: { type: Number, default: 0 },
	total_depenses_main_doeuvre: { type: Number, default: 0 },
	total_depenses_electricite: { type: Number, default: 0 },
	total_depenses_eau: { type: Number, default: 0 },
	total_depenses_transport_vente: { type: Number, default: 0 },
	total_depenses_autres_depenses: { type: Number, default: 0 },

	total_quantite_animaux: { type: Number, default: 0 },
	total_quantite_aliments: { type: Number, default: 0 },
	total_quantite_soins_medicaux: { type: Number, default: 0 },
	total_quantite_amenagements: { type: Number, default: 0 },

	total_transport_animaux: { type: Number, default: 0 },
	total_transport_aliments: { type: Number, default: 0 },
	total_transport_soins_medicaux: { type: Number, default: 0 },
	total_transport_amenagements: { type: Number, default: 0 },
	total_transport_location_local: { type: Number, default: 0 },

	total_budget: { type: Number, default: 0 },

	total_ventes: { type: Number, default: 0 },
	total_quantite_ventes: { type: Number, default: 0 },

	resultat: { type: Number, default: 0 },

	total_pertes: { type: Number, default: 0 },
	total_quantite_pertes: { type: Number, default: 0 },

	total_reformes: { type: Number, default: 0 },

	total_quantite_aliment_restant: { type: Number, default: 0 },
	total_valeur_aliment_restant: { type: Number, default: 0 },

	total_quantite_aliment_consommée: { type: Number, default: 0 },
	total_valeur_aliment_consommée: { type: Number, default: 0 },

	date_arrive: { type: Date },
	created_at: { type: Date },
});

module.exports = mongoose.model("RapportVague", rapportVagueSchema);

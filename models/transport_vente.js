const mongoose = require('mongoose');

  const transport_venteSchema = mongoose.Schema({
		vagueId: { type: String },
		destination: { type: String },
		prix: { type: Number, default: 0 },
		coutParSujet: { type: Number, default: 0 },
		source_financementId: {
			type: String,
			default: "1111afe11f6111f11fce111c",
		},
		source_financement: { type: String, default: "Espèce" },
		transporteur: { type: String },
		facture: { type: String },
		created_at: { type: Date },
  }); 
  

module.exports = mongoose.model('Transport_Vente', transport_venteSchema);
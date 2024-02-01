const mongoose = require("mongoose");

const perteSchema = mongoose.Schema({
	vagueId: { type: String },
	qte_perdu: { type: Number, default:0 },
	valeur_perdu: { type: Number, default:0 },
	date_perte: { type: Date },
	created_at: { type: Date },
});

module.exports = mongoose.model("Perte", perteSchema);

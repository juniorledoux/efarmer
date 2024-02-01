const mongoose = require("mongoose");

const poidsSchema = mongoose.Schema({
	vagueId: { type: String },
	poids: { type: Number, default: 0 },
	date_mesure: { type: Date },
	created_at: { type: Date },
});

module.exports = mongoose.model("Poids", poidsSchema);

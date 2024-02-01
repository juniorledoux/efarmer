const mongoose = require("mongoose");

const stockSchema = mongoose.Schema({
	vagueId: { type: String },
	quantite: { type: Number, default: 0 },
	cummulPerte: { type: Number, default: 0 },
	cummulVente: { type: Number, default: 0 },
	created_at: { type: Date },
});

module.exports = mongoose.model("Stock", stockSchema);

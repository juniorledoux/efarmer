const mongoose = require("mongoose");

const alimentUtiliseSchema = mongoose.Schema({
	alimentId: { type: String },
	qteUtilise: { type: Number, default: 0 },
	valeurConsommee: { type: Number, default: 0 },
	valeurConsommeeParSujet: { type: Number, default: 0 },
	date_debut: { type: Date },
	date_fin: { type: Date },
	recyclage: { type: String, default: "non" },
	recycleDe: { type: String },
	created_at: { type: Date },
});

module.exports = mongoose.model("AlimentUtilise", alimentUtiliseSchema);

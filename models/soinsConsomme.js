const mongoose = require("mongoose");

const soinsConsomme = mongoose.Schema({
	soinsMedicalId: { type: String },
	qteUtilise: { type: Number, default: 0 },
	valeurConsommee: { type: Number, default: 0 },
	valeurConsommeeParSujet: { type: Number, default: 0 },
	date_consommation: { type: Date },
	recyclage: { type: String, default: "non" },
	recycleDe: { type: String },
	created_at: { type: Date },
});

module.exports = mongoose.model("SoinsConsomme", soinsConsomme);

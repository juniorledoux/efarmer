const mongoose = require("mongoose");

const profitsSchema = mongoose.Schema({
	userId: { type: String },
	vagueId: { type: String },
	titre: { type: String },
	montant: { type: Number, default: 0 },
	created_at: { type: Date },
});

module.exports = mongoose.model("Profit", profitsSchema);

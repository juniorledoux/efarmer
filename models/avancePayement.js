const mongoose = require("mongoose");

const avancePayementSchema = mongoose.Schema({
	venteId: { type: String },
	montant: { type: Number, default:0 },
	date_payement: { type: Date }, 
	created_at: { type: Date }, 
});

module.exports = mongoose.model("AvancePayement", avancePayementSchema);

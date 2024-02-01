const mongoose = require('mongoose');

const transport_venteSchema = mongoose.Schema({
	vagueId: { type: String },
	destination: { type: String },
	prix: { type: Number },
	transporteur: { type: String },
	facture: { type: String },
	date: { type: Date },
});

module.exports = mongoose.model('Transports_vente', transport_venteSchema);
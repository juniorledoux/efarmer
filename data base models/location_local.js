const mongoose = require('mongoose');

const location_localSchema = mongoose.Schema({
	vagueId: { type: String },
	titre: { type: String },
	emplacement: { type: String },
	prix: { type: Number },
	transport: { type: Number },
	facture: { type: String },
	date: { type: Date },
});

module.exports = mongoose.model('Locations_local', location_localSchema);
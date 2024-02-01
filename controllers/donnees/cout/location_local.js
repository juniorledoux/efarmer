const Vague = require("../../../models/vague");
const Location_local = require("../../../models/location_local");

//methode get prix
exports.getPrix = (req, res, next) => {
	let prix = 0;
	let transport = 0;
	//recherche d'abord la vague des locations_local que je veux avec le vagueId passé en req
	Vague.findOne({ _id: req.params.vagueId })
		.then((vague) => {
				//si oui je recherche tous les locations_local de cette vague
				Location_local.find({ vagueId: vague._id })
					.then((locations_local) => {
						locations_local.forEach((aliment) => {
							prix += aliment.prix;
							transport += aliment.transport;
						});
						res.status(200).json({
							prix: prix,
							transport: transport,
						});
					})
					.catch((error) => {
						res.status(400).json({ error });
					});
		})
		.catch((error) => {
			res.status(400).json({ error });
		});
};

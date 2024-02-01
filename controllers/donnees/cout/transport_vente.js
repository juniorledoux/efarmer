const Vague = require("../../../models/vague");
const Transport_Vente = require("../../../models/transport_vente");

//methode get prix
exports.getPrix = (req, res, next) => {
	let prix = 0;
	//recherche d'abord la vague des transports_ventes que je veux avec le vagueId passé en req
	Vague.findOne({ _id: req.params.vagueId })
		.then((vague) => {
				//si oui je recherche tous les transports_ventes de cette vague
				Transport_Vente.find({ vagueId: vague._id })
					.then((transports_ventes) => {
						transports_ventes.forEach((element) => {
							prix += element.prix;
						});
						res.status(200).json({
							prix: prix,
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

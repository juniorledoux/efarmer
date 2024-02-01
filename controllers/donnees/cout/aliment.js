const Vague = require("../../../models/vague");
const Aliment = require("../../../models/aliment");

//methode get prix
exports.getPrix = (req, res, next) => {
	let prix = 0;
	let transport = 0;
	let quantite = 0;
	//recherche d'abord la vague des aliments que je veux avec le vagueId passé en req
	Vague.findOne({ _id: req.params.vagueId })
		.then((vague) => {
				//si oui je recherche tous les aliments de cette vague
				Aliment.find({ vagueId: vague._id })
					.then((aliments) => {
						aliments.forEach((aliment) => {
							if (aliment.recyclage != "oui") {
								prix += aliment.prix;
								transport += aliment.transport;
								quantite +=
									aliment.quantite * aliment.poidsUnitaire;
							}
						});
						res.status(200).json({
							prix: prix,
							transport: transport,
							quantite: quantite,
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

const Vague = require("../../../models/vague");
const Amenagement = require("../../../models/amenagement");

//methode get prix
exports.getPrix = (req, res, next) => {
	let prix = 0;
	let transport = 0;
	let quantite = 0;
	//recherche d'abord la vague des amenagement que je veux avec le vagueId passé en req
	Vague.findOne({ _id: req.params.vagueId })
		.then((vague) => {
				//si oui je recherche tous les amenagement de cette vague
				Amenagement.find({ vagueId: vague._id })
					.then((amenagements) => {
						amenagements.forEach((element) => {
							prix += element.prix;
							transport += element.transport;
							quantite += element.quantite;
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

const Vague = require("../../../models/vague");
const Soin_medical = require("../../../models/soin_medical");

//methode get prix
exports.getPrix = (req, res, next) => {
	let prix = 0;
	let transport = 0;
	let quantite = 0;
	//recherche d'abord la vague des soins_medicaux que je veux avec le vagueId passé en req
	Vague.findOne({ _id: req.params.vagueId })
		.then((vague) => {
			//si oui je recherche tous les soins_medicaux de cette vague
			Soin_medical.find({ vagueId: vague._id })
				.then((soins_medicaux) => {
					soins_medicaux.forEach((element) => {
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

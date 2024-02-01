const Vague = require("../../../models/vague");
const Autre_depense = require("../../../models/autre_depense");

//methode get prix
exports.getPrix = (req, res, next) => {
	let prix = 0;
	//recherche d'abord la vague des autre_depenses que je veux avec le vagueId passé en req
	Vague.findOne({ _id: req.params.vagueId })
		.then((vague) => {
				//si oui je recherche tous les autre_depenses de cette vague
				Autre_depense.find({ vagueId: vague._id })
					.then((autre_depenses) => {
						autre_depenses.forEach((element) => {
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

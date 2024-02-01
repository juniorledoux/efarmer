const Vague = require("../../../models/vague");
const Eau = require("../../../models/eau");

//methode get prix
exports.getPrix = (req, res, next) => {
	let prix = 0;
	//recherche d'abord la vague des eaux que je veux avec le vagueId passé en req
	Vague.findOne({ _id: req.params.vagueId })
		.then((vague) => {
			//si oui je recherche tous les eaux de cette vague
			Eau.find({ vagueId: vague._id })
				.then((eaux) => {
					eaux.forEach((element) => {
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
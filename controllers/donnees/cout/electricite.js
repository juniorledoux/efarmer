const Vague = require("../../../models/vague");
const Electricite = require("../../../models/electricite");

//methode get prix
exports.getPrix = (req, res, next) => {
	let prix = 0;
	//recherche d'abord la vague des electricites que je veux avec le vagueId passé en req
	Vague.findOne({ _id: req.params.vagueId })
		.then((vague) => {
				//si oui je recherche tous les electricites de cette vague
				Electricite.find({ vagueId: vague._id })
					.then((electricites) => {
						electricites.forEach((element) => {
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

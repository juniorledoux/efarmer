const Vague = require("../../../models/vague");
const Main_Doeuvre = require("../../../models/main_doeuvre");

//methode get prix
exports.getPrix = (req, res, next) => {
	let prix = 0;
	//recherche d'abord la vague des mains_doeuvres que je veux avec le vagueId passé en req
	Vague.findOne({ _id: req.params.vagueId })
		.then((vague) => {
			//si oui je recherche tous les mains_doeuvres de cette vague
			Main_Doeuvre.find({ vagueId: vague._id })
				.then((mains_doeuvres) => {
					mains_doeuvres.forEach((element) => {
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

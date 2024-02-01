const Vague = require("../../../models/vague");

//methode get prix_animaux
exports.getPrix = (req, res, next) => {
	let prix_animaux = 0;
	let transport = 0;
	let quantite = 0;
	//recherche d'abord la vague des animaux que je veux avec le vagueId passé en req
	Vague.findOne({ _id: req.params.vagueId })
		.then((vague) => {
				prix_animaux += vague.prix_animaux;
				transport += vague.transport;
				quantite += vague.qte_animaux;
				res.status(200).json({
					prix_animaux: prix_animaux,
					transport: transport,
					quantite: quantite,
				});
		})
		.catch((error) => {
			res.status(400).json({ error });
		});
};

const Fournisseur = require("../models/fournisseur");

exports.showAll = (req, res, next) => {
	Fournisseur.find()
		.then((fournisseurs) => {
			res.status(200).json(fournisseurs);
		})
		.catch((error) => {
			res.status(400).json({ error });
		});
};
exports.showByUserId = (req, res, next) => {
	Fournisseur.find({ userId: req.auth.userId })
		.sort({ score: -1 })
		.then((fournisseurs) => {
			res.status(200).json(fournisseurs);
		})
		.catch((error) => {
			res.status(400).json({ error });
		});
};
exports.showOne = (req, res, next) => {
	Fournisseur.findOne({ nom: req.params.nom })
		.then((fournisseur) => {
			res.status(200).json(fournisseur);
		})
		.catch((error) => {
			res.status(400).json({ error });
		});
};

exports.check = (req, res, next) => {
	const thingObject = { ...req.body };
	Fournisseur.findOne({ nom: thingObject.fournisseur }).then(
		async (oneFournisseur) => {
			if (!oneFournisseur) {
				const fournisseur = new Fournisseur({
					userId: req.auth.userId,
					nom: thingObject.fournisseur,
					type: thingObject.type,
					created_at: new Date().toDateString(),
				});
				fournisseur.save();
			} else {
				await Fournisseur.updateOne(
					{ _id: oneFournisseur._id },
					{
						userId: req.auth.userId,
						type: thingObject.type,
						score: oneFournisseur.score + 1,
					}
				);
			}
			res.status(201).json({ message: "Fournisseur check avec succès" });
		}
	);
};

exports.update = (req, res, next) => {
	Fournisseur.updateOne(
		{ _id: req.params.id },
		{
			...req.body,
		}
	)
		.then(() => {
			res.status(201).json({
				message: "Fournisseur modifié avec succès",
			});
		})
		.catch((error) => {
			res.status(400).json({ error });
		});
};

exports.delete = (req, res, next) => {
	Fournisseur.findOne({ _id: req.params.id }).then((fournisseur) => {
		if (fournisseur) {
			Fournisseur.deleteOne({ _id: req.params.id })
				.then(() => {
					res.status(200).json({
						message: "Fournisseur supprimé avec succès",
					});
				})
				.catch((error) => {
					res.status(400).json({ error });
				});
		} else {
			res.status(400).json({
				message: "Déja supprimé",
			});
		}
	});
};

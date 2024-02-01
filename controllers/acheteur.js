const Acheteur = require("../models/acheteur");

exports.showAll = (req, res, next) => {
	Acheteur.find()
		.then((acheteurs) => {
			res.status(200).json(acheteurs);
		})
		.catch((error) => {
			res.status(400).json({ error });
		});
};

exports.showOne = (req, res, next) => {
	Acheteur.findOne({ nom: req.params.nom })
		.then((acheteur) => {
			res.status(200).json(acheteur);
		})
		.catch((error) => {
			res.status(400).json({ error });
		});
};

exports.check = (req, res, next) => {
	const thingObject = { ...req.body };
	Acheteur.findOne({ nom: thingObject.acheteur }).then((oneAcheteur) => {
		if (!oneAcheteur) {
			const acheteur = new Acheteur({
				nom: thingObject.acheteur,
				tel: thingObject.tel_acheteur,
				created_at: new Date().toDateString(),
			});
			acheteur.save().then(() => {
				res.status(201).json({ message: "Acheteur check avec succès" });
			});
		} else {
			if (thingObject.tel_acheteur != oneAcheteur.tel) {
				Acheteur.updateOne(
					{ _id: oneAcheteur._id },
					{
						tel: thingObject.tel_acheteur,
					}
				).then(() => {
					res.status(201).json({
						message: "Acheteur check avec succès",
					});
				});
			}
		}
	});
};

exports.delete = (req, res, next) => {
	Acheteur.findOne({ _id: req.params.id }).then((acheteur) => {
		if (acheteur) {
			Acheteur.deleteOne({ _id: req.params.id })
				.then(() => {
					res.status(200).json({
						message: "Acheteur supprimé avec succes",
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

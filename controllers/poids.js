const Vague = require("../models/vague");
const Poids = require("../models/poids");

//--------------------------------------------------------CRUD pour Poids

//la methode get
exports.showAll = (req, res, next) => {
	//rechrche d'abord la vague des poids que je veux avec le vagueId passé en req
	Vague.findOne({ _id: req.params.vagueId })
		.then((vague) => {
			Poids.find({ vagueId: vague._id })
				.sort({ created_at: -1 })
				.then((poids) => {
					res.status(200).json(poids);
				})
				.catch((error) => {
					res.status(400).json({ error });
				});
		})
		.catch((error) => {
			res.status(400).json({ error });
		});
};

//la methode post
exports.create = (req, res, next) => {
	const thingObject = { ...req.body };
	Vague.findOne({ _id: req.body.vagueId }).then((vague) => {
		const poid = new Poids({
			...thingObject,
			vagueId: req.body.vagueId,
			created_at: new Date().toDateString(),
		});
		poid.save()
			.then(() => {
				Vague.updateOne(
					{ _id: vague._id },
					{
						poidsMoyen_sujet: thingObject.poids,
						userId: req.auth.userId,
						_id: vague._id,
					}
				)
					.then(() => {
						res.status(201).json({
							message: "Poids ajouté avec succes",
						});
					})
					.catch((error) => {
						res.status(500).json({ error });
					});
			})
			.catch((error) => {
				res.status(400).json({ error });
			});
	});
};

//la methode put
exports.update = (req, res, next) => {
	const thingObject = { ...req.body };
	//je verifie d'abord si la vague dans laquelle l'user veut modifier la poid appartient bien a cet user grace a l'id de la poid passé en params
	Poids.findOne({ _id: req.params.id }).then((poid) => {
		Vague.findOne({ _id: poid.vagueId })
			.then((vague) => {
				Poids.updateOne(
					{ _id: req.params.id },
					{
						...thingObject,
						vagueId: req.body.vagueId,
					}
				)
					.then(() => {
						res.status(201).json({
							message: "Poids modifié avec succes",
						});
					})
					.catch((error) => {
						res.status(400).json({ error });
					});
			})
			.catch((error) => {
				res.status(400).json({ error });
			});
	});
};

//la methode get/:id
exports.showOne = (req, res, next) => {
	Poids.findOne({ _id: req.params.id })
		.then((poid) => {
			Vague.findOne({ _id: poid.vagueId })
				.then((vague) => {
					res.status(200).json(poid);
				})
				.catch((error) => {
					res.status(400).json({ error });
				});
		})
		.catch((error) => {
			res.status(400).json({ error });
		});
};

//la methode DELETE
exports.delete = (req, res, next) => {
	//je verifie d'abord si la vague dans laquelle l'user veut supprimer la poid appartient bien a cet user grace a l'id de la poid passé en params
	Poids.findOne({ _id: req.params.id }).then((poids) => {
		if (poids) {
			Poids.deleteOne({ _id: req.params.id })
				.then(() => {
					res.status(200).json({
						message: "Poids supprimée avec succès",
					});
				})
				.catch((error) => {
					res.status(400).json({ error });
				});
		} else {
			res.status(400).json({
				message: "Déja supprimée",
			});
		}
	});
};

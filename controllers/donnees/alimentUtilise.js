const Aliment = require("../../models/aliment");
const AlimentUtilise = require("../../models/alimentUtilise");
const updateProfit = require("../utils/actualiserProfits");
const stockDate = require("../utils/getStockDate");

//--------------------------------------------------------CRUD pour AlimentUtilise

//la methode get
exports.showAll = (req, res, next) => {
	Aliment.findOne({ _id: req.params.alimentId })
		.then((aliment) => {
			AlimentUtilise.find({ alimentId: aliment._id })
				.sort({ created_at: -1 })
				.then((alimentsUtilisees) => {
					alimentsUtilisees.forEach(async (utilisation) => {
						await actualiserValeurConsommee(utilisation);
					});
					res.status(200).json({
						alimentsUtilisees: alimentsUtilisees,
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

//la methode post
exports.create = async (req, res, next) => {
	const thingObject = { ...req.body };

	if (
		(await stockEpuiser(
			thingObject.alimentId,
			parseFloat(thingObject.qteUtilise)
		)) == true
	) {
		return res.status(400).json({ message: "Stock insuffisant" });
	} else {
		let alimentAConsommer = await Aliment.findOne({
			_id: thingObject.alimentId,
		});
		if (
			Date.parse(thingObject.date_debut) <
			Date.parse(alimentAConsommer.dateAchat)
		) {
			return res.status(400).json({
				message:
					"Veuillez entrer une date d'apres l'achat de l'aliment",
			});
		}
		if (
			Date.parse(thingObject.date_fin) <
			Date.parse(thingObject.date_debut)
		) {
			return res.status(400).json({
				message:
					"La date de début ne peut être supérieure à celle de fin.",
			});
		}
		const alimentUtilise = new AlimentUtilise({
			...thingObject,
			alimentId: thingObject.alimentId,
			created_at: new Date().toDateString(),
		});
		alimentUtilise
			.save()
			.then((lastUtilisation) => {
				AlimentUtilise.find({ alimentId: thingObject.alimentId }).then(
					async (alimentsUtilises) => {
						//calcul du nombre utilisé
						let qteUtilise = 0;
						alimentsUtilises.forEach(async (alimentUtil) => {
							qteUtilise += alimentUtil.qteUtilise;
							await actualiserValeurConsommee(alimentUtil);
						});
						//calcul de la valeur de la quantite utilisée
						let aliment = await Aliment.findOne({
							_id: thingObject.alimentId,
						});
						let prixUnitaire =
							(aliment.prix + aliment.transport) /
							(aliment.quantite * aliment.poidsUnitaire);
						Aliment.updateOne(
							{ _id: thingObject.alimentId },
							{
								qteUtilise: qteUtilise,
								valeurQteUtilise: prixUnitaire * qteUtilise,
							}
						)
							.then(async () => {
								await updateProfit.actualiserProfits(
									req.auth.userId
								);
								res.status(201).json({
									message:
										"Aliment utilisé ajouté avec succes",
								});
							})
							.catch((error) => {
								res.status(400).json({ error });
							});
					}
				);
			})
			.catch((error) => {
				res.status(400).json({ error });
			});
	}
};

const stockEpuiser = async (alimentId, newQte, lastQte = 0) => {
	const alimentsUtilises = await AlimentUtilise.find({
		alimentId: alimentId,
	});

	let qteDejaUtilise = 0;

	alimentsUtilises.forEach((alimentUtil) => {
		qteDejaUtilise += alimentUtil.qteUtilise;
	});

	const aliment = await Aliment.findOne({ _id: alimentId });
	if (
		qteDejaUtilise - lastQte + newQte >
		aliment.quantite * aliment.poidsUnitaire
	) {
		return true;
	} else {
		return false;
	}
};

const actualiserValeurConsommee = async (utilisation) => {
	const aliment = await Aliment.findOne({ _id: utilisation.alimentId });

	let valeurConsommee = utilisation.qteUtilise * aliment.prixDuKg;
	let valeurConsommeeParSujet =
		valeurConsommee /
		(await stockDate.getStockDate(aliment.vagueId, utilisation.date_debut));

	await AlimentUtilise.updateOne(
		{ _id: utilisation._id },
		{
			valeurConsommee: valeurConsommee,
			valeurConsommeeParSujet: valeurConsommeeParSujet,
		}
	);
};

//la methode put
exports.update = async (req, res, next) => {
	const thingObject = { ...req.body };
	if (thingObject.date_debut) {
		let alimentAConsommer = await Aliment.findOne({
			_id: thingObject.alimentId,
		});
		if (
			Date.parse(thingObject.date_debut) <
			Date.parse(alimentAConsommer.dateAchat)
		) {
			return res.status(400).json({
				message:
					"Veuillez entrer une date d'après l'achat de l'aliment",
			});
		}
		let alimentUtil = await AlimentUtilise.findOne({ _id: req.params.id });
		if (
			Date.parse(thingObject.date_debut) >
			Date.parse(alimentUtil.date_fin)
		) {
			return res.status(400).json({
				message:
					"La date de début ne peut être supérieure à celle de fin.",
			});
		}
	}
	if (thingObject.date_fin) {
		let alimentUtil = await AlimentUtilise.findOne({ _id: req.params.id });
		if (
			Date.parse(thingObject.date_fin) <
			Date.parse(alimentUtil.date_debut)
		) {
			return res.status(400).json({
				message:
					"La date de début ne peut être supérieure à celle de fin.",
			});
		}
	}
	if (thingObject.qteUtilise) {
		let alimentUtil = await AlimentUtilise.findOne({ _id: req.params.id });
		if (
			(await stockEpuiser(
				thingObject.alimentId,
				parseFloat(thingObject.qteUtilise),
				alimentUtil.qteUtilise
			)) == true
		)
			return res.status(400).json({ message: "Stock insuffisant" });
	}
	AlimentUtilise.updateOne(
		{ _id: req.params.id },
		{
			...thingObject,
		}
	)
		.then(() => {
			AlimentUtilise.find({ alimentId: thingObject.alimentId }).then(
				async (alimentsUtilises) => {
					//calcul du nombre de perte
					let qteUtilise = 0;
					alimentsUtilises.forEach(async (alimentUtil) => {
						qteUtilise += alimentUtil.qteUtilise;
						await actualiserValeurConsommee(alimentUtil);
					});
					//calcul de la valeur de la quantite utilisée
					let aliment = await Aliment.findOne({
						_id: thingObject.alimentId,
					});
					let prixUnitaire =
						(aliment.prix + aliment.transport) /
						(aliment.quantite * aliment.poidsUnitaire);
					Aliment.updateOne(
						{ _id: thingObject.alimentId },
						{
							qteUtilise: qteUtilise,
							valeurQteUtilise: prixUnitaire * qteUtilise,
						}
					)
						.then(async () => {
							await updateProfit.actualiserProfits(
								req.auth.userId
							);
							res.status(201).json({
								message: "Aliment utilisé modifié avec succes",
							});
						})
						.catch((error) => {
							res.status(400).json({ error });
						});
				}
			);
		})
		.catch((error) => {
			res.status(400).json({ error });
		});
};

//la methode get/:id
exports.showOne = (req, res, next) => {
	AlimentUtilise.findOne({ _id: req.params.id })
		.then((alimentUtilise) => {
			res.status(200).json(alimentUtilise);
		})
		.catch((error) => {
			res.status(404).json({ error });
		});
};

//la methode DELETE
exports.delete = (req, res, next) => {
	AlimentUtilise.findOne({ _id: req.params.id }).then((alimentUtilise) => {
		if (alimentUtilise) {
			AlimentUtilise.deleteOne({ _id: req.params.id })
				.then(() => {
					AlimentUtilise.find({
						alimentId: req.params.alimentId,
					}).then(async (alimentsUtilises) => {
						//calcul du nombre de perte
						let qteUtilise = 0;
						alimentsUtilises.forEach(async (alimentUtil) => {
							qteUtilise += alimentUtil.qteUtilise;
							await actualiserValeurConsommee(alimentUtil);
						});
						let aliment = await Aliment.findOne({
							_id: req.params.alimentId,
						});
						let prixUnitaire =
							(aliment.prix + aliment.transport) /
							(aliment.quantite * aliment.poidsUnitaire);
						Aliment.updateOne(
							{ _id: req.params.alimentId },
							{
								qteUtilise: qteUtilise,
								valeurQteUtilise: prixUnitaire * qteUtilise,
							}
						)
							.then(async () => {
								await updateProfit.actualiserProfits(
									req.auth.userId
								);
								res.status(200).json({
									message:
										"Aliment utilisé supprimé avec succes",
								});
							})
							.catch((error) => {
								res.status(400).json({ error });
							});
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

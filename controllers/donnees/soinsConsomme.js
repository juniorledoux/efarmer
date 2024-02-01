const Soin_Medical = require("../../models/soin_medical");
const SoinsConsomme = require("../../models/soinsConsomme");
const updateProfit = require("../utils/actualiserProfits");
const stockDate = require("../utils/getStockDate");

//--------------------------------------------------------CRUD pour SoinsConsomme

//la methode get
exports.showAll = (req, res, next) => {
	Soin_Medical.findOne({ _id: req.params.soinsMedicalId })
		.then((soins_medical) => {
			SoinsConsomme.find({ soinsMedicalId: soins_medical._id })
				.sort({ created_at: -1 })
				.then((soinsConsommes) => {
					soinsConsommes.forEach(async (consommation) => {
						await actualiserValeurConsommee(consommation);
					});
					res.status(200).json({
						soinsConsommes: soinsConsommes,
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
			thingObject.soinsMedicalId,
			parseFloat(thingObject.qteUtilise)
		)) == true
	) {
		return res.status(400).json({ message: "Stock insuffisant" });
	} else {
		let soinsAConsomme = await Soin_Medical.findOne({
			_id: thingObject.soinsMedicalId,
		});
		if (
			Date.parse(thingObject.date_consommation) <
			Date.parse(soinsAConsomme.created_at)
		) {
			return res.status(400).json({
				message:
					"Veuillez entrer une date d'apres l'entré des soins achetés",
			});
		}
		const soinsConsomme = new SoinsConsomme({
			...thingObject,
			soinsMedicalId: thingObject.soinsMedicalId,
			created_at: new Date().toDateString(),
		});
		soinsConsomme
			.save()
			.then((lastConsommation) => {
				SoinsConsomme.find({
					soinsMedicalId: thingObject.soinsMedicalId,
				}).then(async (soinsConsommes) => {
					//calcul du nombre utilisé
					let qteUtilise = 0;
					soinsConsommes.forEach(async (consommation) => {
						qteUtilise += consommation.qteUtilise;
						await actualiserValeurConsommee(consommation);
					});
					//calcul de la valeur de la quantite utilisée
					let soins_medical = await Soin_Medical.findOne({
						_id: thingObject.soinsMedicalId,
					});
					let prixUnitaire =
						(soins_medical.prix + soins_medical.transport) /
						soins_medical.quantite;
					Soin_Medical.updateOne(
						{ _id: thingObject.soinsMedicalId },
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
								message: "Consommation de soins effectuée",
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
	}
};

const stockEpuiser = async (soinsMedicalId, newQte, lastQte = 0) => {
	const soinsConsommes = await SoinsConsomme.find({
		soinsMedicalId: soinsMedicalId,
	});

	let qteDejaUtilise = 0;

	soinsConsommes.forEach((consommation) => {
		qteDejaUtilise += consommation.qteUtilise;
	});

	const soins_medical = await Soin_Medical.findOne({ _id: soinsMedicalId });
	if (qteDejaUtilise - lastQte + newQte > soins_medical.quantite) {
		return true;
	} else {
		return false;
	}
};

const actualiserValeurConsommee = async (consommation) => {
	const soins_medical = await Soin_Medical.findOne({
		_id: consommation.soinsMedicalId,
	});

	let prixUnitaire =
		(soins_medical.prix + soins_medical.transport) / soins_medical.quantite;
	let valeurConsommee = consommation.qteUtilise * prixUnitaire;
	let valeurConsommeeParSujet =
		valeurConsommee /
		(await stockDate.getStockDate(
			soins_medical.vagueId,
			consommation.date_consommation
		));

	await SoinsConsomme.updateOne(
		{ _id: consommation._id },
		{
			valeurConsommee: valeurConsommee,
			valeurConsommeeParSujet: valeurConsommeeParSujet,
		}
	);
};

//la methode put
exports.update = async (req, res, next) => {
	const thingObject = { ...req.body };
	if (thingObject.date_consommation) {
		let soinsAConsommer = await Soin_Medical.findOne({
			_id: thingObject.soinsMedicalId,
		});
		if (
			Date.parse(thingObject.date_consommation) <
			Date.parse(soinsAConsommer.created_at)
		) {
			return res.status(400).json({
				message:
					"Veuillez entrer une date d'apres l'entré des soins achetés",
			});
		}
	}
	if (thingObject.qteUtilise) {
		let soinsConsomme = await SoinsConsomme.findOne({ _id: req.params.id });
		if (
			(await stockEpuiser(
				thingObject.soinsMedicalId,
				parseFloat(thingObject.qteUtilise),
				soinsConsomme.qteUtilise
			)) == true
		)
			return res.status(400).json({ message: "Stock insuffisant" });
	}
	SoinsConsomme.updateOne(
		{ _id: req.params.id },
		{
			...thingObject,
		}
	)
		.then(() => {
			SoinsConsomme.find({
				soinsMedicalId: thingObject.soinsMedicalId,
			}).then(async (soinsConsommes) => {
				//calcul du nombre de perte
				let qteUtilise = 0;
				soinsConsommes.forEach(async (consommation) => {
					qteUtilise += consommation.qteUtilise;
					await actualiserValeurConsommee(consommation);
				});
				//calcul de la valeur de la quantite utilisée
				let soins_medical = await Soin_Medical.findOne({
					_id: thingObject.soinsMedicalId,
				});
				let prixUnitaire =
					(soins_medical.prix + soins_medical.transport) /
					soins_medical.quantite;
				Soin_Medical.updateOne(
					{ _id: thingObject.soinsMedicalId },
					{
						qteUtilise: qteUtilise,
						valeurQteUtilise: prixUnitaire * qteUtilise,
					}
				)
					.then(async () => {
						await updateProfit.actualiserProfits(req.auth.userId);
						res.status(201).json({
							message:
								"Modification de la consommation de soins effectué",
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
};

//la methode get/:id
exports.showOne = (req, res, next) => {
	SoinsConsomme.findOne({ _id: req.params.id })
		.then((consommation) => {
			res.status(200).json(consommation);
		})
		.catch((error) => {
			res.status(404).json({ error });
		});
};

//la methode DELETE
exports.delete = (req, res, next) => {
	SoinsConsomme.findOne({ _id: req.params.id }).then((soinsConsomme) => {
		if (soinsConsomme) {
			SoinsConsomme.deleteOne({ _id: req.params.id })
				.then(() => {
					SoinsConsomme.find({
						soinsMedicalId: req.params.soinsMedicalId,
					}).then(async (soinsConsommes) => {
						//calcul du nombre de perte
						let qteUtilise = 0;
						soinsConsommes.forEach(async (consommation) => {
							qteUtilise += consommation.qteUtilise;
							await actualiserValeurConsommee(consommation);
						});
						let soins_medical = await Soin_Medical.findOne({
							_id: req.params.soinsMedicalId,
						});
						let prixUnitaire =
							(soins_medical.prix + soins_medical.transport) /
							soins_medical.quantite;
						Soin_Medical.updateOne(
							{ _id: req.params.soinsMedicalId },
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
									message: "Consommation de soins supprimée",
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

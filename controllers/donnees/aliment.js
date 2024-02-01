const Vague = require("../../models/vague");
const Aliment = require("../../models/aliment");
const Autre_depense = require("../../models/autre_depense");
const Profits = require("../../models/profits");
const AlimentUtilise = require("../../models/alimentUtilise");
const Fs = require("fs");
const { runInContext } = require("vm");
const updateProfit = require("../utils/actualiserProfits");
const coutParSujet = require("../utils/actualiserCoutParSujet");

//--------------------------------------------------------CRUD pour Aliment

//la methode get
exports.showAll = (req, res, next) => {
	Vague.findOne({ _id: req.params.vagueId })
		.then(async (vague) => {
			await coutParSujet.actualiserCoutParSujet(vague._id);
			await updateProfit.actualiserProfits(req.auth.userId);
			Aliment.find({ vagueId: vague._id })
				.sort({ created_at: -1 })
				.then((aliments) => {
					res.status(200).json(aliments);
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
	const thingObject = req.file
		? {
				...req.body,
				facture: `${req.protocol}://${req.get("host")}/files/${
					req.file.filename
				}`,
		  }
		: { ...req.body };
	//je verifie d'abord si la vague dans laquelle l'user veut creer l'animal appartient bien a cet user grace au vagueId passé en req
	Vague.findOne({ _id: req.body.vagueId }).then(async (vague) => {
		const aliment = new Aliment({
			...thingObject,
			prix: thingObject.prix,
			vagueId: req.body.vagueId,
			created_at: new Date().toDateString(),
		});
		aliment
			.save()
			.then(async (last) => {
				await coutParSujet.actualiserCoutParSujet(vague._id);
				actualiserSources(last, vague, thingObject);
				await updateProfit.actualiserProfits(req.auth.userId);
				res.status(201).json({
					message: "Achat d'aliment ajouté avec succes",
				});
			})
			.catch((error) => {
				res.status(400).json({ error });
			});
	});
};

//la methode put
exports.update = (req, res, next) => {
	const thingObject = req.file
		? {
				...req.body,
				facture: `${req.protocol}://${req.get("host")}/files/${
					req.file.filename
				}`,
		  }
		: { ...req.body };
	Aliment.findOne({ _id: req.params.id }).then((aliment) => {
		if (
			thingObject.quantite &&
			thingObject.quantite * aliment.poidsUnitaire < aliment.qteUtilise
		) {
			return res.status(400).json({
				message: "Quantité est inférieure à la quantité déja utilisée",
			});
		}
		if (
			thingObject.poidsUnitaire &&
			aliment.quantite * thingObject.poidsUnitaire < aliment.qteUtilise
		) {
			return res.status(400).json({
				message: "Quantité est inférieure à la quantité déja utilisée",
			});
		}

		Vague.findOne({ _id: aliment.vagueId })
			.then(async (vague) => {
				await coutParSujet.actualiserCoutParSujet(vague._id);
				actualiserSources(aliment, vague, thingObject);
				await updateProfit.actualiserProfits(req.auth.userId);
				if (thingObject.facture) {
					const filename = aliment.facture.split("/files/")[1];
					Fs.unlink(`files/${filename}`, () => {
						Aliment.updateOne(
							{ _id: req.params.id },
							{
								...thingObject,
								vagueId: req.body.vagueId,
							}
						)
							.then(() => {
								res.status(201).json({
									message:
										"Achat d'aliment modifié avec succes",
								});
							})
							.catch((error) => {
								res.status(400).json({ error });
							});
					});
				} else {
					Aliment.updateOne(
						{ _id: req.params.id },
						{
							...thingObject,
							vagueId: req.body.vagueId,
						}
					)
						.then(() => {
							res.status(201).json({
								message: "Achat d'aliment modifié avec succes",
							});
						})
						.catch((error) => {
							res.status(400).json({ error });
						});
				}
			})
			.catch((error) => {
				res.status(400).json({ error });
			});
	});
};

//la methode get/:id
exports.showOne = (req, res, next) => {
	Aliment.findOne({ _id: req.params.id })
		.then((aliment) => {
			res.status(200).json(aliment);
		})
		.catch((error) => {
			res.status(404).json({ error });
		});
};

//la methode DELETE
exports.delete = (req, res, next) => {
	Aliment.findOne({ _id: req.params.id }).then(async (aliment) => {
		if (aliment) {
			if (aliment.utilisationId) {
				let utilisation = await AlimentUtilise.findOne({
					_id: aliment.utilisationId,
				});
				if (utilisation) {
					await AlimentUtilise.deleteOne({
						_id: aliment.utilisationId,
					});
					let alimentSource = await Aliment.findOne({
						_id: utilisation.alimentId,
					});
					let alimentsUtilises = await AlimentUtilise.find({
						alimentId: utilisation.alimentId,
					});
					//calcul du nombre de perte
					let qteUtilise = 0;
					alimentsUtilises.forEach((alimentUtil) => {
						qteUtilise += alimentUtil.qteUtilise;
					});
					let prixUnitaire =
						(alimentSource.prix + alimentSource.transport) /
						(alimentSource.quantite * alimentSource.poidsUnitaire);
					await Aliment.updateOne(
						{ _id: utilisation.alimentId },
						{
							qteUtilise: qteUtilise,
							valeurQteUtilise: prixUnitaire * qteUtilise,
						}
					);
				}
			}
			Vague.findOne({ _id: aliment.vagueId })
				.then(async (vague) => {
					await AlimentUtilise.deleteMany({
						alimentId: aliment._id,
					});
					await coutParSujet.actualiserCoutParSujet(vague._id);
					actualiserSources(aliment, vague, null);
					await updateProfit.actualiserProfits(req.auth.userId);
					if (aliment.facture) {
						const filename = aliment.facture.split("/files/")[1];
						Fs.unlink(`files/${filename}`, () => {
							Aliment.deleteOne({ _id: req.params.id })
								.then(() => {
									res.status(200).json({
										message:
											"Achat d'aliment supprimé avec succes",
									});
								})
								.catch((error) => {
									res.status(400).json({ error });
								});
						});
					} else {
						Aliment.deleteOne({ _id: req.params.id })
							.then(() => {
								res.status(200).json({
									message:
										"Achat d'aliment supprimé avec succes",
								});
							})
							.catch((error) => {
								res.status(400).json({ error });
							});
					}
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

const actualiserSources = (element, vague, thingObject) => {
	Autre_depense.findOne({ _id: element.source_financementId }).then(
		(autreDepense) => {
			if (autreDepense) {
				Autre_depense.deleteOne({
					_id: autreDepense._id,
				}).then();
				//modification
				if (thingObject != null && !thingObject.source_financementId) {
					Profits.findOne({
						vagueId: autreDepense.vagueId,
					}).then((profit) => {
						let prix = 0;
						if (thingObject.prix) {
							prix =
								parseFloat(thingObject.prix) +
								parseFloat(element.transport);
						} else if (thingObject.transport) {
							prix =
								parseFloat(thingObject.transport) +
								parseFloat(element.prix);
						} else {
							prix =
								parseFloat(element.prix) +
								parseFloat(element.transport);
						}
						const depenses = new Autre_depense({
							titre:
								"Financement pour les aliments de la vague " +
								vague.titre,
							prix: prix,
							financement: 1,
							facture: "",
							vagueId: profit.vagueId,
							created_at: element.dateAchat,
						});
						depenses.save().then((dep) => {
							Aliment.updateOne(
								{ _id: element._id },
								{
									source_financementId: dep._id,
									source_financement: profit.titre,
								}
							).then();
						});
					});
				}
			}
		}
	);
	if (thingObject != null && thingObject.source_financementId) {
		//creation
		if (
			thingObject != null &&
			thingObject.source_financementId != "1111afe11f6111f11fce111c" &&
			thingObject.source_financementId != "1111afe11f6111f11fce112c" &&
			thingObject.source_financementId != "1111afe11f6111f11fce113c"
		) {
			Profits.findOne({ _id: thingObject.source_financementId }).then(
				(profit) => {
					const depenses = new Autre_depense({
						titre:
							"Financement pour les aliments de la vague " +
							vague.titre,
						prix:
							parseFloat(thingObject.prix) +
							parseFloat(thingObject.transport),
						financement: 1,
						facture: "",
						vagueId: profit.vagueId,
						created_at: element.dateAchat,
					});
					depenses.save().then((dep) => {
						Aliment.updateOne(
							{ _id: element._id },
							{
								source_financementId: dep._id,
								source_financement: profit.titre,
							}
						).then();
					});
				}
			);
		} else {
			if (
				thingObject.source_financementId == "1111afe11f6111f11fce111c"
			) {
				Aliment.updateOne(
					{ _id: element._id },
					{
						source_financementId: "1111afe11f6111f11fce111c",
						source_financement: "Espèce",
					}
				).then();
			} else if (
				thingObject.source_financementId == "1111afe11f6111f11fce112c"
			) {
				Aliment.updateOne(
					{ _id: element._id },
					{
						source_financementId: "1111afe11f6111f11fce112c",
						source_financement: "Virement",
					}
				).then();
			} else if (
				thingObject.source_financementId == "1111afe11f6111f11fce113c"
			) {
				Aliment.updateOne(
					{ _id: element._id },
					{
						source_financementId: "1111afe11f6111f11fce113c",
						source_financement: "Mobile",
					}
				).then();
			}
		}
	}
};

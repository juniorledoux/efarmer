const Vague = require("../../models/vague");
const Soin_Medical = require("../../models/soin_medical");
const Autre_depense = require("../../models/autre_depense");
const Profits = require("../../models/profits");
const Fs = require("fs");
const updateProfit = require("../utils/actualiserProfits");
const coutParSujet = require("../utils/actualiserCoutParSujet");
//--------------------------------------------------------CRUD pour Soin_Medical

//la methode get
exports.showAll = (req, res, next) => {
	Vague.findOne({ _id: req.params.vagueId })
		.then(async (vague) => {
			await coutParSujet.actualiserCoutParSujet(vague._id);
			await updateProfit.actualiserProfits(req.auth.userId);
			Soin_Medical.find({ vagueId: vague._id })
				.sort({ created_at: -1 })
				.then((soins_medicaux) => {
					res.status(200).json(soins_medicaux);
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
	Vague.findOne({ _id: req.body.vagueId }).then(async (vague) => {
		const soin_medical = new Soin_Medical({
			...thingObject,
			vagueId: req.body.vagueId,
			created_at: new Date().toDateString(),
		});
		soin_medical
			.save()
			.then(async (last) => {
				await coutParSujet.actualiserCoutParSujet(vague._id);
				actualiserSources(last, vague, thingObject);
				await updateProfit.actualiserProfits(req.auth.userId);
				res.status(201).json({
					message: "Dépense pour médicaments ajoutée avec succes",
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
	Soin_Medical.findOne({ _id: req.params.id }).then((soin_medical) => {
		Vague.findOne({ _id: soin_medical.vagueId })
			.then(async (vague) => {
				await coutParSujet.actualiserCoutParSujet(vague._id);
				actualiserSources(soin_medical, vague, thingObject);
				await updateProfit.actualiserProfits(req.auth.userId);
				if (thingObject.facture) {
					const filename = soin_medical.facture.split("/files/")[1];
					Fs.unlink(`files/${filename}`, () => {
						Soin_Medical.updateOne(
							{ _id: req.params.id },
							{
								...thingObject,
								vagueId: req.body.vagueId,
							}
						)
							.then(() => {
								res.status(201).json({
									message:
										"Dépense pour Médicaments modifiée avec succes",
								});
							})
							.catch((error) => {
								res.status(400).json({ error });
							});
					});
				} else {
					Soin_Medical.updateOne(
						{ _id: req.params.id },
						{
							...thingObject,
							vagueId: req.body.vagueId,
						}
					)
						.then(() => {
							res.status(201).json({
								message:
									"Dépense pour Médicaments modifiée avec succes",
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
	Soin_Medical.findOne({ _id: req.params.id })
		.then((soin_medical) => {
			res.status(200).json(soin_medical);
		})
		.catch((error) => {
			res.status(404).json({ error });
		});
};

//la methode DELETE
exports.delete = (req, res, next) => {
	Soin_Medical.findOne({ _id: req.params.id }).then((soin_medical) => {
		if (soin_medical) {
			Vague.findOne({ _id: soin_medical.vagueId })
				.then(async (vague) => {
					await coutParSujet.actualiserCoutParSujet(vague._id);
					actualiserSources(soin_medical, vague, null);
					await updateProfit.actualiserProfits(req.auth.userId);
					if (soin_medical.facture) {
						const filename =
							soin_medical.facture.split("/files/")[1];
						Fs.unlink(`files/${filename}`, () => {
							Soin_Medical.deleteOne({ _id: req.params.id })
								.then(() => {
									res.status(200).json({
										message:
											"Dépense pour Médicaments supprimée avec succes",
									});
								})
								.catch((error) => {
									res.status(400).json({ error });
								});
						});
					} else {
						Soin_Medical.deleteOne({ _id: req.params.id })
							.then(() => {
								res.status(200).json({
									message:
										"Dépense pour Médicaments supprimée avec succes",
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
				Autre_depense.deleteOne({ _id: autreDepense._id }).then();
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
								"Financement pour une dépense en médicament de la vague " +
								vague.titre,
							prix: prix,
							financement: 1,
							facture: "",
							vagueId: profit.vagueId,
							created_at: element.created_at,
						});
						depenses.save().then((dep) => {
							Soin_Medical.updateOne(
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
							"Financement pour une dépense en médicament de la vague " +
							vague.titre,
						prix:
							parseFloat(thingObject.prix) +
							parseFloat(thingObject.transport),
						financement: 1,
						facture: "",
						vagueId: profit.vagueId,
						created_at: element.created_at,
					});
					depenses.save().then((dep) => {
						Soin_Medical.updateOne(
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
				Soin_Medical.updateOne(
					{ _id: element._id },
					{
						source_financementId: "1111afe11f6111f11fce111c",
						source_financement: "Espèce",
					}
				).then();
			} else if (
				thingObject.source_financementId == "1111afe11f6111f11fce112c"
			) {
				Soin_Medical.updateOne(
					{ _id: element._id },
					{
						source_financementId: "1111afe11f6111f11fce112c",
						source_financement: "Virement",
					}
				).then();
			} else if (
				thingObject.source_financementId == "1111afe11f6111f11fce113c"
			) {
				Soin_Medical.updateOne(
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

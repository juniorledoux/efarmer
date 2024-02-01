const Vague = require("../../models/vague");
const Amenagement = require("../../models/amenagement");
const Autre_depense = require("../../models/autre_depense");
const Profits = require("../../models/profits");
const Fs = require("fs");
const updateProfit = require("../utils/actualiserProfits");
const coutParSujet = require("../utils/actualiserCoutParSujet");
//--------------------------------------------------------CRUD pour Amenagement

//la methode get
exports.showAll = (req, res, next) => {
	Vague.findOne({ _id: req.params.vagueId })
		.then(async (vague) => {
			await coutParSujet.actualiserCoutParSujet(vague._id);
			await updateProfit.actualiserProfits(req.auth.userId);
			Amenagement.find({ vagueId: vague._id })
				.sort({ created_at: -1 })
				.then((amenagements) => {
					res.status(200).json(amenagements);
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
		const amenagement = new Amenagement({
			...thingObject,
			vagueId: req.body.vagueId,
			created_at: new Date().toDateString(),
		});
		amenagement
			.save()
			.then(async (last) => {
				await coutParSujet.actualiserCoutParSujet(vague._id);
				actualiserSources(last, vague, thingObject);
				await updateProfit.actualiserProfits(req.auth.userId);
				res.status(201).json({
					message: "Dépense pour amenagement ajoutée avec succes",
				});
			})
			.catch((error) => {
				res.status(400).json({ error });
			});
	});
};

//la methode put
exports.update = (req, res, next) => {
	//const thingObject = req.body;
	const thingObject = req.file
		? {
				...req.body,
				facture: `${req.protocol}://${req.get("host")}/files/${
					req.file.filename
				}`,
		  }
		: { ...req.body };
	//je verifie d'abord si la vague dans laquelle l'user veut modifier l'amenagement appartient bien a cet user grace a l'id de l'amenagement passé en params
	Amenagement.findOne({ _id: req.params.id }).then((amenagement) => {
		Vague.findOne({ _id: amenagement.vagueId })
			.then(async (vague) => {
				await coutParSujet.actualiserCoutParSujet(vague._id);
				actualiserSources(amenagement, vague, thingObject);
				await updateProfit.actualiserProfits(req.auth.userId);
				if (thingObject.facture) {
					const filename = amenagement.facture.split("/files/")[1];
					Fs.unlink(`files/${filename}`, () => {
						Amenagement.updateOne(
							{ _id: req.params.id },
							{
								...thingObject,
								vagueId: req.body.vagueId,
							}
						)
							.then(() => {
								res.status(201).json({
									message:
										"Dépense pour amenagement modifiée avec succes",
								});
							})
							.catch((error) => {
								res.status(400).json({ error });
							});
					});
				} else {
					Amenagement.updateOne(
						{ _id: req.params.id },
						{
							...thingObject,
							vagueId: req.body.vagueId,
						}
					)
						.then(() => {
							res.status(201).json({
								message:
									"Dépense pour amenagement modifiée avec succes",
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
	Amenagement.findOne({ _id: req.params.id })
		.then((amenagement) => {
			res.status(200).json(amenagement);
		})
		.catch((error) => {
			res.status(404).json({ error });
		});
};

//la methode DELETE
exports.delete = (req, res, next) => {
	//je verifie d'abord si la vague dans laquelle l'user veut supprimer l'animal appartient bien a cet user grace a l'id de l'amenagement passé en params
	Amenagement.findOne({ _id: req.params.id }).then((amenagement) => {
		if (amenagement) {
			Vague.findOne({ _id: amenagement.vagueId })
				.then(async (vague) => {
					await coutParSujet.actualiserCoutParSujet(vague._id);
					actualiserSources(amenagement, vague, null);
					await updateProfit.actualiserProfits(req.auth.userId);
					if (amenagement.facture) {
						const filename =
							amenagement.facture.split("/files/")[1];
						Fs.unlink(`files/${filename}`, () => {
							Amenagement.deleteOne({ _id: req.params.id })
								.then(() => {
									res.status(200).json({
										message:
											"Dépense pour amenagement supprimée avec succes",
									});
								})
								.catch((error) => {
									res.status(400).json({ error });
								});
						});
					} else {
						Amenagement.deleteOne({ _id: req.params.id })
							.then(() => {
								res.status(200).json({
									message:
										"Dépense pour amenagement supprimée avec succes",
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
								"Financement pour l'aménagement de la vague " +
								vague.titre,
							prix: prix,
							financement: 1,
							facture: "",
							vagueId: profit.vagueId,
							created_at: element.created_at,
						});
						depenses.save().then((dep) => {
							Amenagement.updateOne(
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
							"Financement pour l'aménagement de la vague " +
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
						Amenagement.updateOne(
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
				Amenagement.updateOne(
					{ _id: element._id },
					{
						source_financementId: "1111afe11f6111f11fce111c",
						source_financement: "Espèce",
					}
				).then();
			} else if (
				thingObject.source_financementId == "1111afe11f6111f11fce112c"
			) {
				Amenagement.updateOne(
					{ _id: element._id },
					{
						source_financementId: "1111afe11f6111f11fce112c",
						source_financement: "Virement",
					}
				).then();
			} else if (
				thingObject.source_financementId == "1111afe11f6111f11fce113c"
			) {
				Amenagement.updateOne(
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

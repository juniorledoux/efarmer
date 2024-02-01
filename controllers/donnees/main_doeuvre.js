const Vague = require("../../models/vague");
const Main_Doeuvre = require("../../models/main_doeuvre");
const Autre_depense = require("../../models/autre_depense");
const Profits = require("../../models/profits");
const Fs = require("fs");
const updateProfit = require("../utils/actualiserProfits");
const coutParSujet = require("../utils/actualiserCoutParSujet");
//--------------------------------------------------------CRUD pour Main_Doeuvre

//la methode get
exports.showAll = (req, res, next) => {
	Vague.findOne({ _id: req.params.vagueId })
		.then(async (vague) => {
			await coutParSujet.actualiserCoutParSujet(vague._id);
			await updateProfit.actualiserProfits(req.auth.userId);
			Main_Doeuvre.find({ vagueId: vague._id })
				.sort({ created_at: -1 })
				.then((mains_doeuvres) => {
					res.status(200).json(mains_doeuvres);
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
	Vague.findOne({ _id: req.body.vagueId }).then((vague) => {
		const main_doeuvre = new Main_Doeuvre({
			...thingObject,
			vagueId: req.body.vagueId,
			created_at: new Date().toDateString(),
		});
		main_doeuvre
			.save()
			.then(async (last) => {
				await coutParSujet.actualiserCoutParSujet(vague._id);
				actualiserSources(last, vague, thingObject);
				await updateProfit.actualiserProfits(req.auth.userId);
				res.status(201).json({
					message:
						"Dépense pour ressource humaine ajoutée avec succes",
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
	//je verifie d'abord si la vague dans laquelle l'user veut modifier l'main_doeuvre appartient bien a cet user grace a l'id de l'main_doeuvre passé en params
	Main_Doeuvre.findOne({ _id: req.params.id }).then((main_doeuvre) => {
		Vague.findOne({ _id: main_doeuvre.vagueId })
			.then(async (vague) => {
				await coutParSujet.actualiserCoutParSujet(vague._id);
				actualiserSources(main_doeuvre, vague, thingObject);
				await updateProfit.actualiserProfits(req.auth.userId);
				if (thingObject.facture) {
					const filename = main_doeuvre.facture.split("/files/")[1];
					Fs.unlink(`files/${filename}`, () => {
						Main_Doeuvre.updateOne(
							{ _id: req.params.id },
							{
								...thingObject,
								vagueId: req.body.vagueId,
							}
						)
							.then(() => {
								res.status(201).json({
									message:
										"Dépense pour ressource humaine modifiée avec succes",
								});
							})
							.catch((error) => {
								res.status(400).json({ error });
							});
					});
				} else {
					Main_Doeuvre.updateOne(
						{ _id: req.params.id },
						{
							...thingObject,
							vagueId: req.body.vagueId,
						}
					)
						.then(() => {
							res.status(201).json({
								message:
									"Dépense pour ressource humaine modifiée avec succes",
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
	Main_Doeuvre.findOne({ _id: req.params.id })
		.then((main_doeuvre) => {
			res.status(200).json(main_doeuvre);
		})
		.catch((error) => {
			res.status(404).json({ error });
		});
};

//la methode DELETE
exports.delete = (req, res, next) => {
	//je verifie d'abord si la vague dans laquelle l'user veut supprimer l'main_doeuvre appartient bien a cet user grace a l'id de l'main_doeuvre passé en params
	Main_Doeuvre.findOne({ _id: req.params.id }).then((main_doeuvre) => {
		if (main_doeuvre) {
			Vague.findOne({ _id: main_doeuvre.vagueId })
				.then(async (vague) => {
					await coutParSujet.actualiserCoutParSujet(vague._id);
					actualiserSources(main_doeuvre, vague, null);
					await updateProfit.actualiserProfits(req.auth.userId);
					if (main_doeuvre.facture) {
						const filename =
							main_doeuvre.facture.split("/files/")[1];
						Fs.unlink(`files/${filename}`, () => {
							Main_Doeuvre.deleteOne({ _id: req.params.id })
								.then(() => {
									res.status(200).json({
										message:
											"Dépense pour ressource humaine supprimée avec succes",
									});
								})
								.catch((error) => {
									res.status(400).json({ error });
								});
						});
					} else {
						Main_Doeuvre.deleteOne({ _id: req.params.id })
							.then(() => {
								res.status(200).json({
									message:
										"Dépense pour ressource humaine supprimée avec succes",
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
							prix = parseFloat(thingObject.prix);
						} else {
							prix = parseFloat(element.prix);
						}
						const depenses = new Autre_depense({
							titre:
								"Financement pour une ressource humaine de la vague " +
								vague.titre,
							prix: prix,
							financement: 1,
							facture: "",
							vagueId: profit.vagueId,
							created_at: element.created_at,
						});
						depenses.save().then((dep) => {
							Main_Doeuvre.updateOne(
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
							"Financement pour une ressource humaine de la vague " +
							vague.titre,
						prix: parseFloat(thingObject.prix),
						financement: 1,
						facture: "",
						vagueId: profit.vagueId,
						created_at: element.created_at,
					});
					depenses.save().then((dep) => {
						Main_Doeuvre.updateOne(
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
				Main_Doeuvre.updateOne(
					{ _id: element._id },
					{
						source_financementId: "1111afe11f6111f11fce111c",
						source_financement: "Espèce",
					}
				).then();
			} else if (
				thingObject.source_financementId == "1111afe11f6111f11fce112c"
			) {
				Main_Doeuvre.updateOne(
					{ _id: element._id },
					{
						source_financementId: "1111afe11f6111f11fce112c",
						source_financement: "Virement",
					}
				).then();
			} else if (
				thingObject.source_financementId == "1111afe11f6111f11fce113c"
			) {
				Main_Doeuvre.updateOne(
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

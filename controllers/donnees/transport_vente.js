const Vague = require("../../models/vague");
const Transport_Vente = require("../../models/transport_vente");
const Autre_depense = require("../../models/autre_depense");
const Profits = require("../../models/profits");
const Fs = require("fs");
const updateProfit = require("../utils/actualiserProfits");
const coutParSujet = require("../utils/actualiserCoutParSujet");
//--------------------------------------------------------CRUD pour Transport_Vente

//la methode get
exports.showAll = (req, res, next) => {
	Vague.findOne({ _id: req.params.vagueId })
		.then(async (vague) => {
			await coutParSujet.actualiserCoutParSujet(vague._id);
			await updateProfit.actualiserProfits(req.auth.userId);
			Transport_Vente.find({ vagueId: vague._id })
				.sort({ created_at: -1 })
				.then((transports_ventes) => {
					res.status(200).json(transports_ventes);
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
		const transport_vente = new Transport_Vente({
			...thingObject,
			vagueId: req.body.vagueId,
			created_at: new Date().toDateString(),
		});
		transport_vente
			.save()
			.then(async (last) => {
				await coutParSujet.actualiserCoutParSujet(vague._id);
				actualiserSources(last, vague, thingObject);
				await updateProfit.actualiserProfits(req.auth.userId);
				res.status(201).json({
					message: "Charge de livraison ajoutée avec succes",
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
	//je verifie d'abord si la vague dans laquelle l'user veut modifier l'transport_vente appartient bien a cet user grace a l'id de l'transport_vente passé en params
	Transport_Vente.findOne({ _id: req.params.id }).then((transport_vente) => {
		Vague.findOne({ _id: transport_vente.vagueId })
			.then(async (vague) => {
				await coutParSujet.actualiserCoutParSujet(vague._id);
				actualiserSources(transport_vente, vague, thingObject);
				await updateProfit.actualiserProfits(req.auth.userId);
				if (thingObject.facture) {
					const filename =
						transport_vente.facture.split("/files/")[1];
					Fs.unlink(`files/${filename}`, () => {
						Transport_Vente.updateOne(
							{ _id: req.params.id },
							{
								...thingObject,
								vagueId: req.body.vagueId,
							}
						)
							.then(() => {
								res.status(201).json({
									message:
										"Charge de livraison modifiée avec succes",
								});
							})
							.catch((error) => {
								res.status(400).json({ error });
							});
					});
				} else {
					Transport_Vente.updateOne(
						{ _id: req.params.id },
						{
							...thingObject,
							vagueId: req.body.vagueId,
						}
					)
						.then(() => {
							res.status(201).json({
								message:
									"Charge de livraison modifiée avec succes",
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
	Transport_Vente.findOne({ _id: req.params.id })
		.then((transport_vente) => {
			res.status(200).json(transport_vente);
		})
		.catch((error) => {
			res.status(404).json({ error });
		});
};

//la methode DELETE
exports.delete = (req, res, next) => {
	//je verifie d'abord si la vague dans laquelle l'user veut supprimer l'transport_vente appartient bien a cet user grace a l'id de l'transport_vente passé en params
	Transport_Vente.findOne({ _id: req.params.id }).then((transport_vente) => {
		if (transport_vente) {
			Vague.findOne({ _id: transport_vente.vagueId })
				.then(async (vague) => {
					await coutParSujet.actualiserCoutParSujet(vague._id);
					actualiserSources(transport_vente, vague, null);
					await updateProfit.actualiserProfits(req.auth.userId);
					if (transport_vente.facture) {
						const filename =
							transport_vente.facture.split("/files/")[1];
						Fs.unlink(`files/${filename}`, () => {
							Transport_Vente.deleteOne({ _id: req.params.id })
								.then(() => {
									res.status(200).json({
										message:
											"Charge de livraison supprimée avec succes",
									});
								})
								.catch((error) => {
									res.status(400).json({ error });
								});
						});
					} else {
						Transport_Vente.deleteOne({ _id: req.params.id })
							.then(() => {
								res.status(200).json({
									message:
										"Charge de livraison supprimée avec succes",
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
								"Financement pour une charge de livraison de la vague " +
								vague.titre,
							prix: prix,
							financement: 1,
							facture: "",
							vagueId: profit.vagueId,
							created_at: element.created_at,
						});
						depenses.save().then((dep) => {
							Transport_Vente.updateOne(
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
							"Financement pour une charge de livraison de la vague " +
							vague.titre,
						prix: parseFloat(thingObject.prix),
						financement: 1,
						facture: "",
						vagueId: profit.vagueId,
						created_at: element.created_at,
					});
					depenses.save().then((dep) => {
						Transport_Vente.updateOne(
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
				Transport_Vente.updateOne(
					{ _id: element._id },
					{
						source_financementId: "1111afe11f6111f11fce111c",
						source_financement: "Espèce",
					}
				).then();
			} else if (
				thingObject.source_financementId == "1111afe11f6111f11fce112c"
			) {
				Transport_Vente.updateOne(
					{ _id: element._id },
					{
						source_financementId: "1111afe11f6111f11fce112c",
						source_financement: "Virement",
					}
				).then();
			} else if (
				thingObject.source_financementId == "1111afe11f6111f11fce113c"
			) {
				Transport_Vente.updateOne(
					{ _id: element._id },
					{
						source_financementId: "1111afe11f6111f11fce113c",
						source_financement: "Virement",
					}
				).then();
			}
		}
	}
};

const Vague = require("../models/vague");
const fetch = require("node-fetch");
const Fs = require("fs");

//pour la suppression du Compteconst Animal = require("../../models/animal");
const Aliment = require("../models/aliment");
const Amenagement = require("../models/amenagement");
const Location_Local = require("../models/location_local");
const Main_Doeuvre = require("../models/main_doeuvre");
const Soin_Medical = require("../models/soin_medical");
const Eau = require("../models/eau");
const Electricite = require("../models/electricite");
const Autre_Depense = require("../models/autre_depense");
const Transport_Vente = require("../models/transport_vente");
const Perte = require("../models/perte");
const Poids = require("../models/poids");
const Vente = require("../models/vente");
const Stock = require("../models/stock");
const AlimentUtilise = require("../models/alimentUtilise");
const Fournisseur = require("../models/fournisseur");
const updateProfit = require("./utils/actualiserProfits");
const updateAgeSujets = require("./utils/actualiserAgeSujets");
const actualiserStockTable = require("./utils/actualiserStockTable");
const Profit = require("../models/profits");
const coutParSujet = require("./utils/actualiserCoutParSujet");

//la methode get
exports.showAll = (req, res, next) => {
	Vague.find({ userId: req.auth.userId })
		.sort({ created_at: -1 })
		.then(async (vaguesList) => {
			updateAgeSujets.actualiserAgeSujets(req.auth.userId);
			await updateProfit.actualiserProfits(req.auth.userId);
			vaguesList.forEach(async (vague) => {
				await coutParSujet.actualiserCoutParSujet(vague._id);
				actualiserStock(vague._id);
				// await actualiserStockTable.actualiserStockTable(vague._id);
			});
			Vague.find({ userId: req.auth.userId })
				.sort({ created_at: -1 })
				.then((vagues) => {
					res.status(200).json(vagues);
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
	const thingObject = req.file
		? {
				...req.body,
				facture: `${req.protocol}://${req.get("host")}/files/${
					req.file.filename
				}`,
		  }
		: { ...req.body };
	const vague = new Vague({
		...thingObject,
		prix_animaux: thingObject.qte_animaux * thingObject.prix_unitaire,
		userId: req.auth.userId,
		created_at: new Date(new Date().toDateString()),
	});
	vague
		.save()
		.then(async (newVague) => {
			const stock = new Stock({
				vagueId: newVague._id,
				quantite: newVague.qte_animaux,
				created_at: newVague.created_at,
			});
			stock.save().then(async () => {
				updateAgeSujets.actualiserAgeSujets(req.auth.userId);
				await updateProfit.actualiserProfits(req.auth.userId);
				await coutParSujet.actualiserCoutParSujet(newVague._id);
				actualiserStock(newVague._id);
				await actualiserStockTable.actualiserStockTable(newVague._id);
				res.status(201).json({ message: "Vague ajoutée avec succès" });
			});
		})
		.catch((error) => {
			res.status(400).json({ error });
		});
};

//la methode get
exports.getVague = (req, res, next) => {
	Vague.find()
		.then((vagues) => {
			res.status(200).json(vagues);
		})
		.catch((error) => {
			res.status(400).json({ error });
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
	Vague.findOne({ _id: req.params.id })
		.then(async (vague) => {
			if (
				thingObject.qte_animaux &&
				thingObject.qte_animaux <
					vague.NbreSujet_vendu + vague.animaux_perdu
			) {
				return res.status(400).json({
					message: "Quantité est inférieure à la quantité déja gérée",
				});
			}
			if (thingObject.facture) {
				const filename = vague.facture.split("/files/")[1];
				Fs.unlink(`files/${filename}`, () => {
					Vague.updateOne(
						{ _id: req.params.id },
						{
							...thingObject,
						}
					)
						.then(() => {
							Vague.findOne({ _id: req.params.id }).then(
								async (vague) => {
									// if (vague.date_arrive) {
									// 	await Stock.updateOne(
									// 		{
									// 			created_at: vague.created_at,
									// 			vagueId: vague._id,
									// 		},
									// 		{
									// 			created_at: vague.date_arrive,
									// 		}
									// 	);
									// }
									updateAgeSujets.actualiserAgeSujets(
										req.auth.userId
									);
									await updateProfit.actualiserProfits(
										req.auth.userId
									);
									await coutParSujet.actualiserCoutParSujet(
										vague._id
									);
									actualiserStock(vague._id);
									await actualiserStockTable.actualiserStockTable(
										vague._id
									);
									res.status(201).json({
										message: "Vague modifiée avec succès",
									});
								}
							);
						})
						.catch((error) => {
							res.status(400).json({ error });
						});
				});
			} else {
				Vague.updateOne(
					{ _id: req.params.id },
					{
						...thingObject,
					}
				)
					.then(() => {
						Vague.findOne({ _id: req.params.id }).then(
							async (vague) => {
								// if (vague.date_arrive) {
								// 	await Stock.updateOne(
								// 		{
								// 			created_at: vague.created_at,
								// 			vagueId: vague._id,
								// 		},
								// 		{
								// 			created_at: vague.date_arrive,
								// 		}
								// 	);
								// }
								updateAgeSujets.actualiserAgeSujets(
									req.auth.userId
								);
								await updateProfit.actualiserProfits(
									req.auth.userId
								);
								await coutParSujet.actualiserCoutParSujet(
									vague._id
								);
								actualiserStock(vague._id);
								await actualiserStockTable.actualiserStockTable(
									vague._id
								);
								res.status(201).json({
									message: "Vague modifiée avec succès",
								});
							}
						);
					})
					.catch((error) => {
						res.status(400).json({ error });
					});
			}
		})
		.catch((error) => {
			res.status(400).json({ error });
		});
};

//la methode get/:id
exports.showOne = (req, res, next) => {
	Vague.findOne({ _id: req.params.id })
		.then((vague) => {
			res.status(200).json(vague);
		})
		.catch((error) => {
			res.status(404).json({ error });
		});
};

//la methode DELETE
exports.delete = (req, res, next) => {
	Vague.findOne({ _id: req.params.id }).then(async (vague) => {
		if (vague) {
			Aliment.find({ vagueId: vague._id }).then((aliments) => {
				aliments.forEach(async (aliment) => {
					await AlimentUtilise.deleteMany({
						alimentId: aliment._id,
					});
				});
			});
			await Aliment.deleteMany({ vagueId: vague._id });
			await Amenagement.deleteMany({
				vagueId: vague._id,
			});
			await Location_Local.deleteMany({
				vagueId: vague._id,
			});
			await Main_Doeuvre.deleteMany({
				vagueId: vague._id,
			});
			await Soin_Medical.deleteMany({
				vagueId: vague._id,
			});
			await Eau.deleteMany({ vagueId: vague._id });
			await Electricite.deleteMany({
				vagueId: vague._id,
			});
			await Autre_Depense.deleteMany({
				vagueId: vague._id,
			});
			await Transport_Vente.deleteMany({
				vagueId: vague._id,
			});
			await Perte.deleteMany({
				vagueId: vague._id,
			});
			await Poids.deleteMany({
				vagueId: vague._id,
			});
			await Vente.deleteMany({
				vagueId: vague._id,
			});
			await Profit.deleteOne({
				userId: req.auth.userId,
				vagueId: vague._id,
			});
			await Stock.deleteMany({
				vagueId: vague._id,
			});
			updateAgeSujets.actualiserAgeSujets(req.auth.userId);
			await updateProfit.actualiserProfits(req.auth.userId);
			await coutParSujet.actualiserCoutParSujet(vague._id);
			actualiserStock(vague._id);
			await actualiserStockTable.actualiserStockTable(vague._id);
			if (vague.facture) {
				const filename = vague.facture.split("/files/")[1];
				Fs.unlink(`files/${filename}`, () => {
					Vague.deleteOne({ _id: req.params.id })
						.then(() => {
							res.status(200).json({
								message: " Vague Supprimée avec succès",
							});
						})
						.catch((error) => {
							res.status(400).json({ error });
						});
				});
			} else {
				Vague.deleteOne({ _id: req.params.id })
					.then(() => {
						res.status(200).json({
							message: " Vague Supprimée avec succès",
						});
					})
					.catch((error) => {
						res.status(400).json({ error });
					});
			}
		} else {
			res.status(400).json({
				message: " Déja Supprimée",
			});
		}
	});
};

//actualisation du stock
const actualiserStock = (vagueId) => {
	let enStock = 0;
	let budgetTotal = 0;
	Vague.findOne({ _id: vagueId }).then((vague) => {
		enStock =
			vague.qte_animaux - (vague.animaux_perdu + vague.NbreSujet_vendu);
		budgetTotal =
			vague.budget_animaux +
			vague.budget_aliments +
			vague.budget_soins_medicaux +
			vague.budget_amenagements +
			vague.budget_location_local +
			vague.budget_main_doeuvre +
			vague.budget_electricite +
			vague.budget_eau +
			vague.budget_transport_vente +
			vague.budget_autres_depenses;
		Vague.updateOne(
			{ _id: vague._id },
			{
				enStock: enStock,
				budget_prevu: budgetTotal,
			}
		).then(() => {});
	});
};

const actualiserSources = (vague, thingObject = null) => {
	if (vague.sourceBudget_animaux != "Budget propre") {
		Autre_Depense.deleteOne({ _id: vague.sourceBudget_animaux }).then();
	}
	if (vague.sourceBudget_aliments != "Budget propre") {
		Autre_Depense.deleteOne({ _id: vague.sourceBudget_aliments }).then();
	}
	if (vague.sourceBudget_soins_medicaux != "Budget propre") {
		Autre_Depense.deleteOne({
			_id: vague.sourceBudget_soins_medicaux,
		}).then();
	}
	if (vague.sourceBudget_amenagements != "Budget propre") {
		Autre_Depense.deleteOne({
			_id: vague.sourceBudget_amenagements,
		}).then();
	}
	if (vague.sourceBudget_location_local != "Budget propre") {
		Autre_Depense.deleteOne({
			_id: vague.sourceBudget_location_local,
		}).then();
	}
	if (vague.sourceBudget_main_doeuvre != "Budget propre") {
		Autre_Depense.deleteOne({
			_id: vague.sourceBudget_main_doeuvre,
		}).then();
	}
	if (vague.sourceBudget_electricite != "Budget propre") {
		Autre_Depense.deleteOne({ _id: vague.sourceBudget_electricite }).then();
	}
	if (vague.sourceBudget_eau != "Budget propre") {
		Autre_Depense.deleteOne({ _id: vague.sourceBudget_eau }).then();
	}
	if (vague.sourceBudget_transport_vente != "Budget propre") {
		Autre_Depense.deleteOne({
			_id: vague.sourceBudget_transport_vente,
		}).then();
	}
	if (vague.sourceBudget_autres_depenses != "Budget propre") {
		Autre_Depense.deleteOne({
			_id: vague.sourceBudget_autres_depenses,
		}).then();
	}

	if (
		thingObject != null &&
		thingObject.sourceBudget_animaux != "Budget propre"
	) {
		const depenses = new Autre_Depense({
			titre: "Financement pour les sujets de la vague " + vague.titre,
			prix: thingObject.budget_animaux,
			facture: "",
			vagueId: thingObject.sourceBudget_animaux,
			created_at: new Date().toDateString(),
		});
		depenses.save().then((dep) => {
			Vague.updateOne(
				{ _id: vague._id },
				{
					sourceBudget_animaux: dep._id,
				}
			).then();
		});
	} else {
		Vague.updateOne(
			{ _id: vague._id },
			{
				sourceBudget_animaux: "Budget propre",
			}
		).then();
	}

	if (
		thingObject != null &&
		thingObject.sourceBudget_aliments != "Budget propre"
	) {
		const depenses = new Autre_Depense({
			titre: "Financement pour les aliments de la vague " + vague.titre,
			prix: thingObject.budget_aliments,
			facture: "",
			vagueId: thingObject.sourceBudget_aliments,
			created_at: new Date().toDateString(),
		});
		depenses.save().then((dep) => {
			Vague.updateOne(
				{ _id: vague._id },
				{
					sourceBudget_aliments: dep._id,
				}
			).then();
		});
	} else {
		Vague.updateOne(
			{ _id: vague._id },
			{
				sourceBudget_aliments: "Budget propre",
			}
		).then();
	}

	if (
		thingObject != null &&
		thingObject.sourceBudget_soins_medicaux != "Budget propre"
	) {
		const depenses = new Autre_Depense({
			titre:
				"Financement pour les médicaments de la vague " +
				vague.titre,
			prix: thingObject.budget_soins_medicaux,
			facture: "",
			vagueId: thingObject.sourceBudget_soins_medicaux,
			created_at: new Date().toDateString(),
		});
		depenses.save().then((dep) => {
			Vague.updateOne(
				{ _id: vague._id },
				{
					sourceBudget_soins_medicaux: dep._id,
				}
			).then();
		});
	} else {
		Vague.updateOne(
			{ _id: vague._id },
			{
				sourceBudget_soins_medicaux: "Budget propre",
			}
		).then();
	}

	if (
		thingObject != null &&
		thingObject.sourceBudget_amenagements != "Budget propre"
	) {
		const depenses = new Autre_Depense({
			titre: "Financement pour l'aménagement de la vague " + vague.titre,
			prix: thingObject.budget_amenagements,
			facture: "",
			vagueId: thingObject.sourceBudget_amenagements,
			created_at: new Date().toDateString(),
		});
		depenses.save().then((dep) => {
			Vague.updateOne(
				{ _id: vague._id },
				{
					sourceBudget_amenagements: dep._id,
				}
			).then();
		});
	} else {
		Vague.updateOne(
			{ _id: vague._id },
			{
				sourceBudget_amenagements: "Budget propre",
			}
		).then();
	}

	if (
		thingObject != null &&
		thingObject.sourceBudget_location_local != "Budget propre"
	) {
		const depenses = new Autre_Depense({
			titre:
				"Financement pour la location du local de la vague " +
				vague.titre,
			prix: thingObject.budget_location_local,
			facture: "",
			vagueId: thingObject.sourceBudget_location_local,
			created_at: new Date().toDateString(),
		});
		depenses.save().then((dep) => {
			Vague.updateOne(
				{ _id: vague._id },
				{
					sourceBudget_location_local: dep._id,
				}
			).then();
		});
	} else {
		Vague.updateOne(
			{ _id: vague._id },
			{
				sourceBudget_location_local: "Budget propre",
			}
		).then();
	}

	if (
		thingObject != null &&
		thingObject.sourceBudget_main_doeuvre != "Budget propre"
	) {
		const depenses = new Autre_Depense({
			titre:
				"Financement pour la resource humaine de la vague " +
				vague.titre,
			prix: thingObject.budget_main_doeuvre,
			facture: "",
			vagueId: thingObject.sourceBudget_main_doeuvre,
			created_at: new Date().toDateString(),
		});
		depenses.save().then((dep) => {
			Vague.updateOne(
				{ _id: vague._id },
				{
					sourceBudget_main_doeuvre: dep._id,
				}
			).then();
		});
	} else {
		Vague.updateOne(
			{ _id: vague._id },
			{
				sourceBudget_main_doeuvre: "Budget propre",
			}
		).then();
	}

	if (
		thingObject != null &&
		thingObject.sourceBudget_electricite != "Budget propre"
	) {
		const depenses = new Autre_Depense({
			titre: "Financement pour l'éléctricite de la vague " + vague.titre,
			prix: thingObject.budget_electricite,
			facture: "",
			vagueId: thingObject.sourceBudget_electricite,
			created_at: new Date().toDateString(),
		});
		depenses.save().then((dep) => {
			Vague.updateOne(
				{ _id: vague._id },
				{
					sourceBudget_electricite: dep._id,
				}
			).then();
		});
	} else {
		Vague.updateOne(
			{ _id: vague._id },
			{
				sourceBudget_electricite: "Budget propre",
			}
		).then();
	}

	if (
		thingObject != null &&
		thingObject.sourceBudget_eau != "Budget propre"
	) {
		const depenses = new Autre_Depense({
			titre: "Financement pour l'eau de la vague " + vague.titre,
			prix: thingObject.budget_eau,
			facture: "",
			vagueId: thingObject.sourceBudget_eau,
			created_at: new Date().toDateString(),
		});
		depenses.save().then((dep) => {
			Vague.updateOne(
				{ _id: vague._id },
				{
					sourceBudget_eau: dep._id,
				}
			).then();
		});
	} else {
		Vague.updateOne(
			{ _id: vague._id },
			{
				sourceBudget_eau: "Budget propre",
			}
		).then();
	}

	if (
		thingObject != null &&
		thingObject.sourceBudget_transport_vente != "Budget propre"
	) {
		const depenses = new Autre_Depense({
			titre:
				"Financement pour les charges de livraison de la vague " +
				vague.titre,
			prix: thingObject.budget_transport_vente,
			facture: "",
			vagueId: thingObject.sourceBudget_transport_vente,
			created_at: new Date().toDateString(),
		});
		depenses.save().then((dep) => {
			Vague.updateOne(
				{ _id: vague._id },
				{
					sourceBudget_transport_vente: dep._id,
				}
			).then();
		});
	} else {
		Vague.updateOne(
			{ _id: vague._id },
			{
				sourceBudget_transport_vente: "Budget propre",
			}
		).then();
	}

	if (
		thingObject != null &&
		thingObject.sourceBudget_autres_depenses != "Budget propre"
	) {
		const depenses = new Autre_Depense({
			titre:
				"Financement pour les autres dépenses de la vague " +
				vague.titre,
			prix: thingObject.budget_autres_depenses,
			facture: "",
			vagueId: thingObject.sourceBudget_autres_depenses,
			created_at: new Date().toDateString(),
		});
		depenses.save().then((dep) => {
			Vague.updateOne(
				{ _id: vague._id },
				{
					sourceBudget_autres_depenses: dep._id,
				}
			).then();
		});
	} else {
		Vague.updateOne(
			{ _id: vague._id },
			{
				sourceBudget_autres_depenses: "Budget propre",
			}
		).then();
	}
};

const Vague = require("../models/vague");
const Perte = require("../models/perte");
const Vente = require("../models/vente");
const updateProfit = require("./utils/actualiserProfits");
const actualiserStockTable = require("./utils/actualiserStockTable");

//--------------------------------------------------------CRUD pour Perte

//la methode get
exports.showAll = (req, res, next) => {
	Vague.findOne({ _id: req.params.vagueId })
		.then(async (vague) => {
			await updateProfit.actualiserProfits(req.auth.userId);
			await actualiserStockTable.actualiserStockTable(vague._id);
			actualiserStock(vague._id);
			//si oui je recherche tous les pertes de cette vague
			Perte.find({ vagueId: req.params.vagueId })
				.sort({ date_perte: -1 })
				.then((pertes) => {
					Perte.find({ vagueId: req.params.vagueId })
						.sort({ date_perte: 1 })
						.then((perteOrdonner) => {
							res.status(200).json({
								pertes: pertes,
								perteOrdonner: perteOrdonner,
							});
						})
						.catch((error) => {
							res.status(400).json({ error });
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
exports.create = (req, res, next) => {
	const thingObject = { ...req.body };
	Vague.findOne({ _id: req.body.vagueId }).then(async (vague) => {
		if (vague.etat == 0) {
			return res
				.status(400)
				.json({ message: "Veuillez d'abords démarrer la vague" });
		}
		if (
			Date.parse(thingObject.date_perte) < Date.parse(vague.date_arrive)
		) {
			return res.status(400).json({
				message:
					"Veuillez entrer une date d'après l'arrivée des sujets",
			});
		}

		if (
			Date.parse(thingObject.date_perte) >
			Date.parse(new Date().toDateString())
		) {
			return res.status(400).json({
				message: "Veuilleéz entrer une date passée valide",
			});
		}

		if (
			(await stockEpuiser(
				vague._id,
				parseFloat(thingObject.qte_perdu)
			)) == true
		) {
			return res.status(400).json({ message: "Stock insuffisant" });
		}

		const perte = new Perte({
			...thingObject,
			vagueId: req.body.vagueId,
			created_at: new Date().toDateString(),
		});
		perte
			.save()
			.then((newPerte) => {
				Perte.find({ vagueId: vague._id }).then((pertes) => {
					//calcul du nombre de perte
					let nombrePerte = 0;
					let valeurPerdu = 0;
					pertes.forEach((perte) => {
						nombrePerte += perte.qte_perdu;
						valeurPerdu += perte.valeur_perdu;
					});
					Vague.updateOne(
						{ _id: vague._id },
						{
							animaux_perdu: nombrePerte,
							valeur_animaux_perdu: valeurPerdu,
						}
					)
						.then(async () => {
							await updateProfit.actualiserProfits(
								req.auth.userId
							);
							await actualiserStockTable.actualiserStockTable(
								vague._id
							);
							actualiserStock(vague._id);
							res.status(201).json({
								message: "Perte ajoutée avec succes",
							});
						})
						.catch((error) => {
							res.status(500).json({ error });
						});
				});
			})
			.catch((error) => {
				res.status(400).json({ error });
			});
	});
};

//actualisation du stock
const actualiserStock = (vagueId) => {
	let enStock = 0;
	Vague.findOne({ _id: vagueId }).then((vague) => {
		enStock =
			vague.qte_animaux - (vague.animaux_perdu + vague.NbreSujet_vendu);
		Vague.updateOne(
			{ _id: vague._id },
			{
				enStock: enStock,
			}
		).then(() => {});
	});
};

const stockEpuiser = async (vagueId, newQte, lastQte = 0) => {
	const pertes = await Perte.find({ vagueId: vagueId });

	let nombreDejaPerdue = 0;

	pertes.forEach((perte) => {
		nombreDejaPerdue += perte.qte_perdu;
	});

	const ventes = await Vente.find({ vagueId: vagueId });

	let nombreSujetVendu = 0;

	ventes.forEach((vente) => {
		nombreSujetVendu += vente.qte_vendu;
	});

	const vague = await Vague.findOne({ _id: vagueId });

	if (
		nombreDejaPerdue - lastQte + (newQte + nombreSujetVendu) >
		vague.qte_animaux
	) {
		return true;
	} else {
		return false;
	}
};

//la methode put
exports.update = (req, res, next) => {
	const thingObject = { ...req.body };
	Perte.findOne({ _id: req.params.id }).then((perte) => {
		Vague.findOne({ _id: perte.vagueId })
			.then(async (vague) => {
				if (thingObject.date_perte) {
					if (
						Date.parse(thingObject.date_perte) <
						Date.parse(vague.date_arrive)
					) {
						return res.status(400).json({
							message:
								"Veuillez entrer une date d'après l'arrivée des sujets",
						});
					}

					if (
						Date.parse(thingObject.date_perte) >
						Date.parse(new Date().toDateString())
					) {
						return res.status(400).json({
							message: "Veuilleéz entrer une date passée valide",
						});
					}
				}
				if (thingObject.qte_perdu) {
					if (
						(await stockEpuiser(
							vague._id,
							parseFloat(thingObject.qte_perdu),
							perte.qte_perdu
						)) == true
					) {
						return res
							.status(400)
							.json({ message: "Stock insuffisant" });
					}
				}

				Perte.updateOne(
					{ _id: req.params.id },
					{
						...thingObject,
					}
				)
					.then(() => {
						Perte.find({ vagueId: vague._id }).then((pertes) => {
							//calcul du nombre de perte
							let nombrePerte = 0;
							let valeurPerdu = 0;
							pertes.forEach((perte) => {
								nombrePerte += perte.qte_perdu;
								valeurPerdu += perte.valeur_perdu;
							});
							Vague.updateOne(
								{ _id: vague._id },
								{
									animaux_perdu: nombrePerte,
									valeur_animaux_perdu: valeurPerdu,
								}
							)
								.then(async () => {
									await updateProfit.actualiserProfits(
										req.auth.userId
									);
									await actualiserStockTable.actualiserStockTable(
										vague._id
									);
									actualiserStock(vague._id);
									res.status(201).json({
										message: "Perte modifiée avec succes",
									});
								})
								.catch((error) => {
									res.status(500).json({ error });
								});
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
	Perte.findOne({ _id: req.params.id })
		.then((perte) => {
			Vague.findOne({ _id: perte.vagueId })
				.then((vague) => {
					res.status(200).json(perte);
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
	Perte.findOne({ _id: req.params.id }).then((perte) => {
		if (perte) {
			Vague.findOne({ _id: perte.vagueId })
				.then((vague) => {
					Perte.deleteOne({ _id: req.params.id }).then(() => {
						Perte.find({ vagueId: vague._id }).then((pertes) => {
							//calcul du nombre de perte
							let nombrePerte = 0;
							let valeurPerdu = 0;
							pertes.forEach((perte) => {
								nombrePerte += perte.qte_perdu;
								valeurPerdu += perte.valeur_perdu;
							});
							Vague.updateOne(
								{ _id: vague._id },
								{
									animaux_perdu: nombrePerte,
									valeur_animaux_perdu: valeurPerdu,
								}
							)
								.then(async () => {
									await updateProfit.actualiserProfits(
										req.auth.userId
									);
									await actualiserStockTable.actualiserStockTable(
										vague._id
									);
									actualiserStock(vague._id);
									res.status(200).json({
										message: "Perte supprimée avec succes",
									});
								})
								.catch((error) => {
									res.status(500).json({ error });
								});
						});
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

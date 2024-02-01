const Vague = require("../models/vague");
const Vente = require("../models/vente");
const Perte = require("../models/perte");
const AvancePayement = require("../models/avancePayement");
const updateProfit = require("./utils/actualiserProfits");
const actualiserStockTable = require("./utils/actualiserStockTable");

//--------------------------------------------------------CRUD pour Vente

//la methode get
exports.showAll = (req, res, next) => {
	//rechrche d'abord la vague des ventes que je veux avec le vagueId passé en req
	Vague.findOne({ _id: req.params.vagueId })
		.then(async (vague) => {
			await updateProfit.actualiserProfits(req.auth.userId);
			await actualiserStockTable.actualiserStockTable(vague._id);
			actualiserStock(vague._id);
			//si oui je recherche tous les ventes de cette vague
			Vente.find({ vagueId: vague._id })
				.sort({ date_vente: -1 })
				.then((ventes) => {
					res.status(200).json({ ventes: ventes });
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
			return res.status(400).json({
				message: "Veuillez d'abords démarrer la vague",
			});
		}
		if (
			Date.parse(thingObject.date_vente) < Date.parse(vague.date_arrive)
		) {
			return res.status(400).json({
				message:
					"Veuillez entrer une date d'après l'arrivée des sujets",
			});
		}
		if (
			Date.parse(thingObject.date_vente) >
			Date.parse(new Date().toDateString())
		) {
			return res.status(400).json({
				message: "Veuilleéz entrer une date passée valide",
			});
		}

		if (
			(await stockEpuiser(
				thingObject.vagueId,
				parseFloat(thingObject.qte_vendu)
			)) == true
		) {
			return res.status(400).json({ message: "Stock insuffisant" });
		}

		const vente = new Vente({
			...thingObject,
			vagueId: req.body.vagueId,
			created_at: new Date().toDateString(),
		});
		vente
			.save()
			.then((lastVente) => {
				Vente.find({ vagueId: vague._id }).then((ventes) => {
					//calcul du nombre de sujet vendu
					let nombreSujetVendu = 0;
					ventes.forEach((vente) => {
						nombreSujetVendu += vente.qte_vendu;
					});
					//calcul du prix moyen de vente
					let prixTotalVente = 0;
					ventes.forEach((vente) => {
						// if (vente.mode_payement == "Immédiat") {
						prixTotalVente += vente.prix_vente;
						// } else {
						// 	prixTotalVente += vente.montant_avance;
						// }
					});
					let prixMoyenVente;
					if (nombreSujetVendu == 0) {
						prixMoyenVente = prixTotalVente / 1;
					} else {
						prixMoyenVente = prixTotalVente / nombreSujetVendu;
					}
					Vague.updateOne(
						{ _id: vague._id },
						{
							NbreSujet_vendu: nombreSujetVendu,
							prixMoyenVente_sujet: prixMoyenVente,
						}
					)
						.then(async () => {
							if (lastVente.mode_payement == "Différé") {
								const avance = new AvancePayement({
									venteId: lastVente._id,
									montant: lastVente.montant_avance,
									date_payement: lastVente.date_vente,
									created_at: new Date().toDateString(),
								});
								avance.save().then(() => {});
							}
							await updateProfit.actualiserProfits(
								req.auth.userId
							);
							await actualiserStockTable.actualiserStockTable(
								vague._id
							);
							actualiserStock(vague._id);
							res.status(201).json({
								message: "Vente ajoutée avec succes",
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
	const ventes = await Vente.find({ vagueId: vagueId });

	let nombreSujetDejaVendu = 0;

	ventes.forEach((vente) => {
		nombreSujetDejaVendu += vente.qte_vendu;
	});

	const pertes = await Perte.find({ vagueId: vagueId });

	let nombrePerte = 0;

	pertes.forEach((perte) => {
		nombrePerte += perte.qte_perdu;
	});

	const vague = await Vague.findOne({ _id: vagueId });

	if (
		nombreSujetDejaVendu - lastQte + (newQte + nombrePerte) >
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
	Vente.findOne({ _id: req.params.id }).then((vente) => {
		Vague.findOne({ _id: vente.vagueId })
			.then(async (vague) => {
				if (thingObject.date_vente) {
					if (
						Date.parse(thingObject.date_vente) <
						Date.parse(vague.date_arrive)
					) {
						return res.status(400).json({
							message:
								"Veuillez entrer une date d'après l'arrivée des sujets",
						});
					}
					if (
						Date.parse(thingObject.date_vente) >
						Date.parse(new Date().toDateString())
					) {
						return res.status(400).json({
							message: "Veuilleéz entrer une date passée valide",
						});
					}
				}
				if (thingObject.qte_vendu) {
					if (
						(await stockEpuiser(
							vague._id,
							parseFloat(thingObject.qte_vendu),
							vente.qte_vendu
						)) == true
					) {
						return res
							.status(400)
							.json({ message: "Stock insuffisant" });
					}
				}
				Vente.updateOne(
					{ _id: req.params.id },
					{
						...thingObject,
					}
				)
					.then(() => {
						Vente.find({ vagueId: vague._id }).then((ventes) => {
							//calcul du nombre de sujet vendu
							let nombreSujetVendu = 0;
							ventes.forEach((vente) => {
								nombreSujetVendu += vente.qte_vendu;
							});
							//calcul du prix moyen de vente
							let prixTotalVente = 0;
							ventes.forEach((vente) => {
								// if (vente.mode_payement == "Immédiat") {
								prixTotalVente += vente.prix_vente;
								// } else {
								// 	prixTotalVente +=
								// 		vente.montant_avance;
								// }
							});
							let prixMoyenVente;
							if (nombreSujetVendu == 0) {
								prixMoyenVente = prixTotalVente / 1;
							} else {
								prixMoyenVente =
									prixTotalVente / nombreSujetVendu;
							}
							Vague.updateOne(
								{ _id: vague._id },
								{
									NbreSujet_vendu: nombreSujetVendu,
									prixMoyenVente_sujet: prixMoyenVente,
								}
							)
								.then(async () => {
									Vente.findOne({
										_id: req.params.id,
									}).then((lastVente) => {
										AvancePayement.find({
											venteId: req.params.id,
										}).then((avances) => {
											//update les montant avancés et restants
											let montantAvancer = 0;
											if (
												lastVente.mode_payement ==
												"Immédiat"
											) {
												montantAvancer =
													lastVente.prix_vente;
											} else {
												avances.forEach((avance) => {
													montantAvancer +=
														avance.montant;
												});
											}
											Vente.updateOne(
												{ _id: req.params.id },
												{
													montant_avance:
														montantAvancer,
													montant_restant:
														lastVente.prix_vente -
														montantAvancer,
												}
											).then(async () => {
												await updateProfit.actualiserProfits(
													req.auth.userId
												);
												await actualiserStockTable.actualiserStockTable(
													vague._id
												);
												actualiserStock(vague._id);
												res.status(201).json({
													message:
														"Vente modifiée avec succes",
												});
											});
										});
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
	Vente.findOne({ _id: req.params.id })
		.then((vente) => {
			res.status(200).json(vente);
		})
		.catch((error) => {
			res.status(404).json({ error });
		});
};

//la methode DELETE
exports.delete = (req, res, next) => {
	Vente.findOne({ _id: req.params.id }).then((vente) => {
		if (vente) {
			Vente.deleteOne({ _id: req.params.id })
				.then(() => {
					Vague.findOne({ _id: req.params.vagueId }).then((vague) => {
						Vente.find({ vagueId: vague._id })
							.then((ventes) => {
								//calcul du nombre de sujet vendu
								let nombreSujetVendu = 0;
								ventes.forEach((vente) => {
									nombreSujetVendu += vente.qte_vendu;
								});
								//calcul du prix moyen de vente
								let prixTotalVente = 0;
								ventes.forEach((vente) => {
									// if (vente.mode_payement == "Immédiat") {
									prixTotalVente += vente.prix_vente;
									// } else {
									// 	prixTotalVente += vente.montant_avance;
									// }
								});
								let prixMoyenVente;
								if (nombreSujetVendu == 0) {
									prixMoyenVente = prixTotalVente / 1;
								} else {
									prixMoyenVente =
										prixTotalVente / nombreSujetVendu;
								}
								Vague.updateOne(
									{ _id: vague._id },
									{
										NbreSujet_vendu: nombreSujetVendu,
										prixMoyenVente_sujet: prixMoyenVente,
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
											message:
												"Vente supprimée avec succes",
										});
									})
									.catch((error) => {
										res.status(500).json({ error });
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
		} else {
			res.status(400).json({
				message: "Déja supprimée",
			});
		}
	});
};

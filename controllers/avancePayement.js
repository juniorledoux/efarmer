const AvancePayement = require("../models/avancePayement");
const Vente = require("../models/vente");
const updateProfit = require("./utils/actualiserProfits");

//la methode get
exports.showAll = (req, res, next) => {
	Vente.findOne({ _id: req.params.venteId })
		.then(async (vente) => {
			await updateProfit.actualiserProfits(req.auth.userId);
			AvancePayement.find({ venteId: vente._id })
				.sort({ date_payement: -1 })
				.then((avances) => {
					res.status(200).json({ avances: avances });
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
	Vente.findOne({ _id: req.body.venteId }).then((vente) => {
		const avance = new AvancePayement({
			...thingObject,
			venteId: req.body.venteId,
			created_at: new Date().toDateString(),
		});
		avance
			.save()
			.then(() => {
				AvancePayement.find({
					venteId: req.body.venteId,
				}).then((avances) => {
					let montantAvancer = 0;
					if (vente.mode_payement == "Immédiat") {
						montantAvancer = vente.prix_vente;
					} else {
						avances.forEach((avance) => {
							montantAvancer += avance.montant;
						});
					}
					Vente.updateOne(
						{ _id: req.body.venteId },
						{
							montant_avance: montantAvancer,
							montant_restant: vente.prix_vente - montantAvancer,
						}
					)
						.then(async () => {
							await updateProfit.actualiserProfits(
								req.auth.userId
							);
							res.status(201).json({
								message: "Avance ajoutée avec succès",
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
	});
};

//la methode DELETE
exports.delete = (req, res, next) => {
	AvancePayement.findOne({ _id: req.params.id })
		.then((avance) => {
			if (avance) {
				Vente.findOne({ _id: avance.venteId }).then((vente) => {
					AvancePayement.deleteOne({ _id: req.params.id })
						.then(() => {
							AvancePayement.find({
								venteId: vente._id,
							}).then((avances) => {
								let montantAvancer = 0;
								if (vente.mode_payement == "Immédiat") {
									montantAvancer = vente.prix_vente;
								} else {
									avances.forEach((avance) => {
										montantAvancer += avance.montant;
									});
								}
								Vente.updateOne(
									{ _id: vente._id },
									{
										montant_avance: montantAvancer,
										montant_restant:
											vente.prix_vente - montantAvancer,
									}
								)
									.then(async () => {
										await updateProfit.actualiserProfits(
											req.auth.userId
										);
										res.status(200).json({
											message:
												"Avance supprimée avec succès",
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
				});
			} else {
				res.status(400).json({
					message: "Déja supprimé",
				});
			}
		})
		.catch((error) => {
			res.status(400).json({ error });
		});
};

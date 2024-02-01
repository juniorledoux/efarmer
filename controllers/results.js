const Vague = require("../models/vague");
// const utils = require("./utils/resultsUtils");
const utilsDate = require("./utils/resultsDate");
const stockDate = require("./utils/getStockDate");
const Vente = require("../models/vente");
const Perte = require("../models/perte");
const Stock = require("../models/stock");

//methode getValeurActu
exports.getValeurActu = (req, res, next) => {
	const vagueId = req.params.id;
	const date = new Date().toDateString();
	Vague.findOne({
		_id: vagueId,
	})
		.then(async (vague) => {
			let depenseActuelle = await utilsDate.depensesActuelles(
				vagueId,
				date
			);
			let cummulVentes = await getCummulVentes(vagueId, date);
			let enStock = await stockDate.getStockDate(vagueId, date);
			let valeurActuelle = (depenseActuelle - cummulVentes) / enStock;
			res.status(200).json({
				valeurActuelle: valeurActuelle,
			});
		})
		.catch((error) => {
			res.status(500).json({
				error,
			});
		});
};
// exports.getValeurActu = (req, res, next) => {
// 	const vagueId = req.params.id;
// 	const date = new Date().toDateString();
// 	Vague.findOne({
// 		_id: vagueId,
// 	})
// 		.then(async (vague) => {
// 			let coutDepensesParSujet =
// 				await utilsDate.sommeCoutDepensesParSujet(vagueId, date);
// 			let cummulVentes =
// 				(await getCummulVentes(vagueId, date)) /
// 				(await stockDate.getStockDate(vagueId, date));
// 			let cummulPertes =
// 				(await getCummulPertes(vagueId, date)) /
// 				(await stockDate.getStockDate(vagueId, date));
// 			let valeurActuelle =
// 				coutDepensesParSujet + cummulPertes - cummulVentes;

// 			res.status(200).json({
// 				valeurActuelle: valeurActuelle,
// 			});
// 		})
// 		.catch((error) => {
// 			res.status(500).json({
// 				error,
// 			});
// 		});
// };

const getCummulVentes = async (vagueId, date) => {
	let cummulVentes = 0;
	const ventes = await Vente.find({ vagueId: vagueId });
	ventes.forEach((vente) => {
		if (Date.parse(vente.date_vente) <= Date.parse(date)) {
			cummulVentes += vente.prix_vente;
		}
	});
	return cummulVentes;
};
const getCummulPertes = async (vagueId, date) => {
	let cummulPertes = 0;
	const pertes = await Perte.find({ vagueId: vagueId });
	pertes.forEach((perte) => {
		if (Date.parse(perte.date_perte) <= Date.parse(date)) {
			cummulPertes += perte.valeur_perdu;
		}
	});
	return cummulPertes;
};

//methode getValeurSurDate
exports.getValeurSurDate = (req, res, next) => {
	const vagueId = req.params.id;
	const date = req.body.date;
	Vague.findOne({
		_id: vagueId,
	})
		.then(async (vague) => {
			if (Date.parse(date) < Date.parse(vague.date_arrive)) {
				return res.status(400).json({
					message:
						"Veuillez entrer une date d'après l'arrivée des sujets.",
				});
			}
			let depenseActuelle = await utilsDate.depensesActuelles(
				vagueId,
				date
			);
			let cummulVentes = await getCummulVentes(vagueId, date);
			let enStock = await stockDate.getStockDate(vagueId, date);
			let valeurSurDate = (depenseActuelle - cummulVentes) / enStock;
			res.status(200).json({
				valeurSurDate: valeurSurDate,
			});
		})
		.catch((error) => {
			res.status(500).json({
				error,
			});
		});
};

//methode getDepensesActu
exports.getDepensesActu = (req, res, next) => {
	const vagueId = req.params.id;
	const date = new Date().toDateString();
	Vague.findOne({
		_id: vagueId,
	})
		.then(async (vague) => {
			let depenseActuelle = await utilsDate.depensesActuelles(
				vagueId,
				date
			);
			res.status(200).json({
				depenseActuelle: depenseActuelle,
			});
		})
		.catch((error) => {
			res.status(500).json({
				error,
			});
		});
};

//methode getReste
exports.getReste = (req, res, next) => {
	const vagueId = req.params.id;
	const date = new Date().toDateString();
	Vague.findOne({
		_id: vagueId,
	})
		.then(async (vague) => {
			let depenseActuelle = await utilsDate.depensesActuelles(
				vagueId,
				date
			);
			let reste = parseFloat(vague.budget_prevu) - depenseActuelle;
			res.status(200).json({
				reste: reste,
			});
		})
		.catch((error) => {
			res.status(500).json({
				error,
			});
		});
};

//methode getValeurSurBenef (la valeur d'une vague en fonction du benefice attendue)
exports.getValeurSurBenef = (req, res, next) => {
	const vagueId = req.params.id;
	const date = new Date().toDateString();
	Vague.findOne({
		_id: vagueId,
	})
		.then(async (vague) => {
			let depenseActuelle = await utilsDate.depensesActuelles(
				vagueId,
				date
			);
			let cummulVentes = await getCummulVentes(vagueId, date);
			let enStock = await stockDate.getStockDate(vagueId, date);
			let benefice = parseFloat(req.body.benef_attendu);
			let valeurSurBenef =
				(benefice + depenseActuelle - cummulVentes) / enStock;
			//marge beneficiaires
			let margeBenef = 0;
			if (vague.budget_prevu != 0) {
				margeBenef =
					(parseFloat(req.body.benef_attendu) * 100) /
					parseFloat(vague.budget_prevu);
			}
			res.status(200).json({
				valeurSurBenef: valeurSurBenef,
				margeBenef: margeBenef,
			});
		})
		.catch((error) => {
			res.status(500).json({
				error,
			});
		});
};

//methode getValeurActu
exports.getBenefSurPrix = (req, res, next) => {
	const vagueId = req.params.id;
	const date = new Date().toDateString();
	Vague.findOne({
		_id: vagueId,
	})
		.then(async (vague) => {
			let enStock = await stockDate.getStockDate(vagueId, date);
			let chiffreAffaire = parseFloat(req.body.prixMarche) * enStock;
			let depenseActuelle = await utilsDate.depensesActuelles(
				vagueId,
				date
			);
			let cummulVentes = await getCummulVentes(vagueId, date);
			let valeurDesSujets = depenseActuelle - cummulVentes;
			let benefSurPrix = chiffreAffaire - valeurDesSujets;
			res.status(200).json({
				benefSurPrix: benefSurPrix,
			});
		})
		.catch((error) => {
			res.status(500).json({
				error,
			});
		});
};

//methode getValeurActu
exports.getBenefSurVente = (req, res, next) => {
	const vagueId = req.params.id;
	const date = new Date().toDateString();
	Vague.findOne({
		_id: vagueId,
	})
		.then(async (vague) => {
			// let quantiteAnimaux = 0;
			// quantiteAnimaux = quantiteAnimaux + vague.qte_animaux;
			//pour eviter l'erreur critique de la division par 0
			// if (quantiteAnimaux === 0) quantiteAnimaux = 1;
			let depenseActuelle = await utilsDate.depensesActuelles(
				vagueId,
				date
			);
			// let valeurActuelle = depenseActuelle / quantiteAnimaux;
			//la valeur excate de tous les sujets vendus
			// let valeurExactSujet = valeurActuelle * vague.NbreSujet_vendu;
			Vente.find({ vagueId: vague._id }).then((ventes) => {
				if (ventes) {
					let montantTotalVentes = 0;
					ventes.forEach((vente) => {
						montantTotalVentes += vente.prix_vente;
						// if (vente.mode_payement == "Immédiat") {
						// 	montantTotalVentes += vente.prix_vente;
						// } else {
						// 	montantTotalVentes += vente.montant_avance;
						// }
					});
					let benefSurVente = montantTotalVentes - depenseActuelle;
					res.status(200).json({
						benefSurVente: benefSurVente,
					});
				} else {
					res.status(200).json({
						benefSurVente: 0,
					});
				}
			});
		})
		.catch((error) => {
			res.status(500).json({
				error,
			});
		});
};

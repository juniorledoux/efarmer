// const Animal = require("../../models/animal");
const Vague = require("../../models/vague");
const Stock = require("../../models/stock");
const Perte = require("../../models/perte");
const Vente = require("../../models/vente");

//calculs de la sommes des prix
exports.actualiserStockTable = async (vagueId) => {
	let stocksList = await Stock.find({ vagueId: vagueId });
	if (stocksList.length > 0) {
		// await Stock.deleteMany({ vagueId: vagueId });
		let stockInitial = await Vague.findOne({ _id: vagueId });
		let pertesList = await Perte.find({ vagueId: vagueId });
		let ventesList = await Vente.find({ vagueId: vagueId });
		let age_sujet = stockInitial.age_sujet > 0 ? stockInitial.age_sujet : 1;
		//le jour est compté en millisecondes
		for (
			let jour = Date.parse(
				stockInitial.date_arrive
					? stockInitial.date_arrive
					: stockInitial.created_at
			);
			jour <=
			Date.parse(
				stockInitial.date_arrive
					? stockInitial.date_arrive
					: stockInitial.created_at
			) +
				86400 * 1000 * age_sujet;
			jour += 86400 * 1000
		) {
			// console.log(new Date(jour).toDateString());
			let cummulPerte = 0;
			let cummulVente = 0;

			pertesList.forEach((perte) => {
				if (Date.parse(perte.date_perte) <= jour) {
					cummulPerte += perte.qte_perdu;
				}
			});
			ventesList.forEach((vente) => {
				if (Date.parse(vente.date_vente) <= jour) {
					cummulVente += vente.qte_vendu;
				}
			});
			let enStockDuJour = 0;
			enStockDuJour =
				stockInitial.qte_animaux - (cummulPerte + cummulVente);

			let stockDuJour = await Stock.findOne({
				created_at: new Date(new Date(jour).toDateString()),
				vagueId: vagueId,
			});
			if (stockDuJour) {
				await Stock.updateOne(
					{
						_id: stockDuJour._id,
					},
					{
						quantite: enStockDuJour,
						cummulPerte: cummulPerte,
						cummulVente: cummulVente,
					}
				);
			} else {
				if (jour <= Date.parse(new Date().toDateString())) {
					const stock = new Stock({
						vagueId: vagueId,
						quantite: enStockDuJour,
						cummulPerte: cummulPerte,
						cummulVente: cummulVente,
						created_at: new Date(new Date(jour).toDateString()),
					});
					await stock.save();
				}
			}
		}
	} else {
		let vague = await Vague.findOne({ _id: vagueId });
		if (vague) {
			const stock = new Stock({
				vagueId: vague._id,
				quantite: vague.qte_animaux,
				created_at: new Date(
					new Date(
						vague.date_arrive ? vague.date_arrive : vague.created_at
					).toDateString()
				),
			});
			await stock.save();
		}
	}
};

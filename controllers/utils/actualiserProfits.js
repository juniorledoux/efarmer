// const Animal = require("../../models/animal");
const Vague = require("../../models/vague");
const Vente = require("../../models/vente");
const Profit = require("../../models/profits");
const utilsDate = require("./resultsDate");

//calculs de la sommes des prix
exports.actualiserProfits = async (userId) => {
	const profitsList = await Profit.find({
		userId: userId,
	});
	if (profitsList.length > 0) {
		profitsList.forEach(async (profit) => {
			const vague = await Vague.findOne({ _id: profit.vagueId });
			if (!vague) {
				await Profit.deleteOne({ _id: profit._id });
			}
		});
	}

	const vagueList = await Vague.find({ userId: userId });
	vagueList.forEach(async (vague) => {
		const date = new Date().toDateString();
		let depenseActuelle = await utilsDate.depensesActuelles(
			vague._id,
			date
		);

		let profits = 0;
		let montantTotalVentes = 0;

		const ventes = await Vente.find({ vagueId: vague._id }).sort({
			date_vente: -1,
		});
		if (ventes.length > 0) {
			ventes.forEach((vente) => {
				montantTotalVentes += vente.prix_vente;
			});
			profits = montantTotalVentes - depenseActuelle;

			const profit = await Profit.findOne({
				userId: userId,
				vagueId: vague._id,
			});
			if (profit) {
				await Profit.updateOne(
					{ _id: profit._id },
					{
						titre: "Profit de la vague " + vague.titre,
						montant: profits,
						created_at: ventes[0].date_vente,
					}
				);
			} else {
				const newProfit = new Profit({
					userId: userId,
					vagueId: vague._id,
					titre: "Profit de la vague " + vague.titre,
					montant: profits,
					created_at: ventes[0].date_vente,
				});
				await newProfit.save();
			}
		}
	});
};

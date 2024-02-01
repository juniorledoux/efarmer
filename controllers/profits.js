const Profits = require("../models/profits");
const Vague = require("../models/vague");
const updateProfit = require("./utils/actualiserProfits");

exports.showAll = (req, res, next) => {
	Profits.find({ userId: req.auth.userId })
		.sort({ montant: -1 })
		.then(async (profits) => {
			await updateProfit.actualiserProfits(req.auth.userId);
			res.status(200).json(profits);
		})
		.catch((error) => {
			res.status(400).json({ error });
		});
};

exports.showAllForRapport = (req, res, next) => {
	Profits.find({ userId: req.auth.userId })
		.sort({ created_at: 1 })
		.then(async (profits) => {
			await updateProfit.actualiserProfits(req.auth.userId);
			res.status(200).json(profits);
		})
		.catch((error) => {
			res.status(400).json({ error });
		});
};

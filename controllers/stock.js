const Stock = require("../models/stock");
const Vague = require("../models/vague");
const actualiserStockTable = require("./utils/actualiserStockTable");

exports.showAll = (req, res, next) => {
	Vague.findOne({ _id: req.params.vagueId })
		.then(async (vague) => {
			await actualiserStockTable.actualiserStockTable(vague._id);
			Stock.find({ vagueId: req.params.vagueId })
				.sort({ created_at: 1 })
				.then((stocks) => {
					res.status(200).json(stocks);
				})
				.catch((error) => {console.log(error);
					res.status(400).json({ error });
				});
		})
		.catch((error) => {console.log(error);
			res.status(400).json({ error });
		});
};

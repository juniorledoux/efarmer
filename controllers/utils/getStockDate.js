// const Animal = require("../../models/animal");
const Stock = require("../../models/stock");

//calculs de la sommes des prix
exports.getStockDate = async (vagueId, date) => {
	let enStock = 0;
	let stockDate = await Stock.findOne({ created_at: date, vagueId: vagueId });
	if (stockDate) {
		enStock = stockDate.quantite;
	} else {
		let stocks = await Stock.find({ vagueId: vagueId }).sort({
			created_at: 1,
		});
		if (stocks.length == 1) {
			enStock = stocks[0].quantite;
		} else if (stocks.length > 1) {
			for (let index = 0; index < stocks.length; index++) {
				const stock = stocks[index];
				if (Date.parse(stock.created_at) == Date.parse(date)) {
					enStock = stock.quantite;
					break;
				} else if (
					index > 0 &&
					Date.parse(stock.created_at) > Date.parse(date)
				) {
					enStock = stocks[index - 1].quantite;
					break;
				}
				//  else {
				// 	enStock = stock.quantite;
				// 	break;
				// }
			}
			if (enStock == 0) {
				enStock = stocks[stocks.length - 1].quantite;
			}
		}
	}

	return enStock;
};

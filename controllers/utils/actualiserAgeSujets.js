// const Animal = require("../../models/animal");
const Vague = require("../../models/vague");

//calculs de la sommes des prix
exports.actualiserAgeSujets = (userId) => {
	Vague.find({ userId: userId }).then((vagues) => {
		vagues.forEach(async (vague) => {
			if (vague.date_arrive && vague.etat == 1) {
				let age = 0;
				age = Math.round(
					(Date.now() - Date.parse(vague.date_arrive)) /
						(86400 * 1000)
				);
				await Vague.updateOne(
					{ _id: vague._id },
					{
						age_sujet: age,
					}
				);
			}
		});
	});
};

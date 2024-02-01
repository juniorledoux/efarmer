const RapportVague = require("../../models/rapport_vague");
const Vague = require("../../models/vague");

exports.createRapportVague = async (req, res, next) => {
	const thingObject = { ...req.body };

	const rapportVague = new RapportVague({
		...thingObject,
		vagueId: thingObject.vagueId,
		created_at: new Date().toDateString(),
	});
	rapportVague
		.save()
		.then(() => {
			res.status(201).json({
				message: "Rapport de la vague créée avec succès",
			});
		})
		.catch((error) => {
			res.status(400).json({ error });
		});
};

//la methode get/:id
exports.showOne = (req, res, next) => {
	RapportVague.findOne({ vagueId: req.params.vagueId })
		.then((rapportVague) => {
			res.status(200).json(rapportVague);
		})
		.catch((error) => {
			res.status(404).json({ error });
		});
};

const Vague = require("../../models/vague");
const Soin_Medical = require("../../models/soin_medical");
const SoinsConsomme = require("../../models/soinsConsomme");
const updateProfit = require("../utils/actualiserProfits");

//la methode post
exports.recycler = async (req, res, next) => {
	const thingObject = { ...req.body };

	const soins_medical = new Soin_Medical({
		vagueId: req.params.vagueId,
		titre: "Réutilisation de " + thingObject.titre,
		quantite: thingObject.quantite - thingObject.qteUtilise,
		prix:
			(thingObject.prix / thingObject.quantite) *
			(thingObject.quantite - thingObject.qteUtilise),
		fournisseur: thingObject.fournisseur,
		fournisseurId: thingObject.fournisseurId,
		transport:
			(thingObject.transport / thingObject.quantite) *
			(thingObject.quantite - thingObject.qteUtilise),
		facture: thingObject.facture,
		recyclage: "oui",
		utilisationId: thingObject._id,
		created_at: new Date().toDateString(),
	});
	soins_medical
		.save()
		.then((nouveauSoinsMedical) => {
			const soinsConsomme = new SoinsConsomme({
				soinsMedicalId: nouveauSoinsMedical._id,
				qteUtilise: nouveauSoinsMedical.quantite,
				date_consommation: new Date().toDateString(),
				recyclage: "oui",
				recycleDe: thingObject._id,
				created_at: new Date().toDateString(),
			});
			soinsConsomme
				.save()
				.then(async (nouvelConsommation) => {
					await Soin_Medical.updateOne(
						{ _id: nouveauSoinsMedical._id },
						{
							utilisationId: nouvelConsommation._id,
						}
					);

					SoinsConsomme.find({
						soinsMedicalId: nouveauSoinsMedical._id,
					}).then(async (soinsConsommes) => {
						//calcul du nombre utilisé
						let qteUtilise = 0;
						soinsConsommes.forEach((consommation) => {
							qteUtilise += consommation.qteUtilise;
						});
						//calcul de la valeur de la quantite utilisée
						let soins_medical = await Soin_Medical.findOne({
							_id: nouveauSoinsMedical._id,
						});
						let prixUnitaire =
							(soins_medical.prix + soins_medical.transport) /
							soins_medical.quantite;
						Soin_Medical.updateOne(
							{ _id: nouveauSoinsMedical._id },
							{
								qteUtilise: qteUtilise,
								valeurQteUtilise: prixUnitaire * qteUtilise,
							}
						)
							.then(async () => {
								await updateProfit.actualiserProfits(
									req.auth.userId
								);
								res.status(201).json({
									message: "Réutilisation des soins effectuée",
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
		})
		.catch((error) => {
			res.status(400).json({ error });
		});
};

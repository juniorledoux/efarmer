const Vague = require("../../models/vague");
const Aliment = require("../../models/aliment");
const AlimentUtilise = require("../../models/alimentUtilise");
const updateProfit = require("../utils/actualiserProfits");

//la methode post
exports.recycler = async (req, res, next) => {
	const thingObject = { ...req.body };

	const aliment = new Aliment({
		vagueId: req.params.vagueId,
		titre: "Réutilisation de " + thingObject.titre,
		quantite:
			thingObject.quantite * thingObject.poidsUnitaire -
			thingObject.qteUtilise,
		prix:
			(thingObject.prix /
				(thingObject.quantite * thingObject.poidsUnitaire)) *
			(thingObject.quantite * thingObject.poidsUnitaire -
				thingObject.qteUtilise),
		poidsUnitaire: thingObject.poidsUnitaire,
		fournisseur: thingObject.fournisseur,
		fournisseurId: thingObject.fournisseurId,
		transport:
			(thingObject.transport /
				(thingObject.quantite * thingObject.poidsUnitaire)) *
			(thingObject.quantite * thingObject.poidsUnitaire -
				thingObject.qteUtilise),
		dateAchat: thingObject.dateAchat,
		facture: thingObject.facture,
		recyclage: "oui",
		utilisationId: thingObject._id,
		created_at: new Date().toDateString(),
	});
	aliment
		.save()
		.then((nouveauAliment) => {
			const alimentUtilise = new AlimentUtilise({
				alimentId: nouveauAliment._id,
				qteUtilise: nouveauAliment.quantite,
				date_debut: new Date().toDateString(),
				date_fin: new Date(
					new Date(new Date().toDateString()).getTime() + 86400 * 1000
				),
				recyclage: "oui",
				recycleDe: thingObject._id,
				created_at: new Date().toDateString(),
			});
			alimentUtilise
				.save()
				.then(async (nouvelUtilisation) => {
					await Aliment.updateOne(
						{ _id: nouveauAliment._id },
						{
							utilisationId: nouvelUtilisation._id,
						}
					);

					AlimentUtilise.find({
						alimentId: nouveauAliment._id,
					}).then(async (alimentsUtilises) => {
						//calcul du nombre utilisé
						let qteUtilise = 0;
						alimentsUtilises.forEach((alimentUtil) => {
							qteUtilise += alimentUtil.qteUtilise;
						});
						//calcul de la valeur de la quantite utilisée
						let aliment = await Aliment.findOne({
							_id: nouveauAliment._id,
						});
						let prixUnitaire =
							(aliment.prix + aliment.transport) /
							(aliment.quantite * aliment.poidsUnitaire);
						Aliment.updateOne(
							{ _id: nouveauAliment._id },
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
									message: "Aliment réutilisé avec succes",
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

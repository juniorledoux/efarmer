// const Animal = require("../../models/animal");
const Vague = require("../../models/vague");
const Aliment = require("../../models/aliment");
const Amenagement = require("../../models/amenagement");
const Location_Local = require("../../models/location_local");
const Main_Doeuvre = require("../../models/main_doeuvre");
const Soin_Medical = require("../../models/soin_medical");
const Eau = require("../../models/eau");
const Electricite = require("../../models/electricite");
const Autre_Depense = require("../../models/autre_depense");
const Transport_Vente = require("../../models/transport_vente");
const stockDate = require("./getStockDate");

//calculs de la sommes des prix
exports.actualiserCoutParSujet = async (vagueId) => {
	const aliments = await Aliment.find({ vagueId: vagueId });
	aliments.forEach(async (aliment) => {
		let prixDuKg =
			(aliment.prix + aliment.transport) /
			(aliment.quantite * aliment.poidsUnitaire);

		let coutParSujet =
			(aliment.prix + aliment.transport) /
			(await stockDate.getStockDate(vagueId, aliment.dateAchat));

		await Aliment.updateOne(
			{ _id: aliment._id },
			{
				prixDuKg: prixDuKg,
				coutParSujet: coutParSujet,
			}
		);
	});

	const amenagements = await Amenagement.find({ vagueId: vagueId });
	amenagements.forEach(async (amenagement) => {
		let coutParSujet =
			(amenagement.prix + amenagement.transport) /
			(await stockDate.getStockDate(vagueId, amenagement.created_at));

		await Amenagement.updateOne(
			{ _id: amenagement._id },
			{
				coutParSujet: coutParSujet,
			}
		);
	});

	const autres_depenses = await Autre_Depense.find({ vagueId: vagueId });
	autres_depenses.forEach(async (autre_depense) => {
		let coutParSujet =
			autre_depense.prix /
			(await stockDate.getStockDate(vagueId, autre_depense.created_at));

		await Autre_Depense.updateOne(
			{ _id: autre_depense._id },
			{
				coutParSujet: coutParSujet,
			}
		);
	});

	const eaux = await Eau.find({ vagueId: vagueId });
	eaux.forEach(async (eau) => {
		let coutParSujet =
			eau.prix / (await stockDate.getStockDate(vagueId, eau.created_at));

		await Eau.updateOne(
			{ _id: eau._id },
			{
				coutParSujet: coutParSujet,
			}
		);
	});

	const electricites = await Electricite.find({ vagueId: vagueId });
	electricites.forEach(async (electricite) => {
		let coutParSujet =
			electricite.prix /
			(await stockDate.getStockDate(vagueId, electricite.created_at));

		await Electricite.updateOne(
			{ _id: electricite._id },
			{
				coutParSujet: coutParSujet,
			}
		);
	});

	const location_locaux = await Location_Local.find({ vagueId: vagueId });
	location_locaux.forEach(async (location_local) => {
		let coutParSujet =
			(location_local.prix + location_local.transport) /
			(await stockDate.getStockDate(vagueId, location_local.created_at));

		await Location_Local.updateOne(
			{ _id: location_local._id },
			{
				coutParSujet: coutParSujet,
			}
		);
	});

	const mains_doeuvres = await Main_Doeuvre.find({ vagueId: vagueId });
	mains_doeuvres.forEach(async (main_doeuvre) => {
		let coutParSujet =
			main_doeuvre.prix /
			(await stockDate.getStockDate(vagueId, main_doeuvre.created_at));

		await Main_Doeuvre.updateOne(
			{ _id: main_doeuvre._id },
			{
				coutParSujet: coutParSujet,
			}
		);
	});

	const soins_medicaux = await Soin_Medical.find({ vagueId: vagueId });
	soins_medicaux.forEach(async (soin_medical) => {
		let prixDuKg =
			(soin_medical.prix + soin_medical.transport) /
			soin_medical.quantite;

		let coutParSujet =
			(soin_medical.prix + soin_medical.transport) /
			(await stockDate.getStockDate(vagueId, soin_medical.created_at));

		await Soin_Medical.updateOne(
			{ _id: soin_medical._id },
			{
				prixDuKg: prixDuKg,
				coutParSujet: coutParSujet,
			}
		);
	});

	const transports_ventes = await Transport_Vente.find({ vagueId: vagueId });
	transports_ventes.forEach(async (transport_vente) => {
		let coutParSujet =
			transport_vente.prix /
			(await stockDate.getStockDate(vagueId, transport_vente.created_at));

		await Transport_Vente.updateOne(
			{ _id: transport_vente._id },
			{
				coutParSujet: coutParSujet,
			}
		);
	});

	const vague = await Vague.findOne({ _id: vagueId });
	let coutParSujet =
		(vague.prix_animaux + vague.transport) /
		(await stockDate.getStockDate(
			vagueId,
			vague.date_arrive ? vague.date_arrive : vague.created_at
		));

	await Vague.updateOne(
		{ _id: vague._id },
		{
			coutParSujet: coutParSujet,
		}
	);
};

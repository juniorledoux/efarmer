// const Animal = require("../../models/animal");
const Vague = require("../../models/vague");
const Aliment = require("../../models/aliment");
const AlimentUtilise = require("../../models/alimentUtilise");
const Amenagement = require("../../models/amenagement");
const Location_Local = require("../../models/location_local");
const Main_Doeuvre = require("../../models/main_doeuvre");
const Soin_Medical = require("../../models/soin_medical");
const SoinsConsomme = require("../../models/soinsConsomme");
const Eau = require("../../models/eau");
const Electricite = require("../../models/electricite");
const Autre_Depense = require("../../models/autre_depense");
const Transport_Vente = require("../../models/transport_vente");

//calculs de la sommes des prix
exports.depensesActuelles = async (vagueId, DATE) => {
	let prixVague = 0;
	let prixAliment = 0;
	let prixAmenagement = 0;
	let prixLocationLocal = 0;
	let prixMainOeuvre = 0;
	let prixSoinMedical = 0;
	let prixEau = 0;
	let prixElectricite = 0;
	let prixAutreDepense = 0;
	let transportVente = 0;

	//recuperation des prix et les auto-sommer au cas où il en aurais plusieurs enregistrement dans la BD
	const vagues = await Vague.find({ _id: vagueId });
	vagues.forEach((vague) => {
		if (
			Date.parse(
				vague.date_arrive ? vague.date_arrive : vague.created_at
			) <= Date.parse(DATE)
		) {
			prixVague += vague.prix_animaux + vague.transport;
		}
	});

	const aliments = await Aliment.find({ vagueId: vagueId });
	aliments.forEach(async (aliment) => {
		// if (aliment.recyclage != "oui") {
		if (Date.parse(aliment.dateAchat) <= Date.parse(DATE)) {
			const alimentsUtilisees = await AlimentUtilise.find({
				alimentId: aliment._id,
			});
			alimentsUtilisees.forEach((utilisation) => {
				if (Date.parse(DATE) <= Date.parse(utilisation.date_debut)) {
					prixAliment += 0;
				} else if (
					Date.parse(DATE) >= Date.parse(utilisation.date_fin)
				) {
					prixAliment += utilisation.valeurConsommee;
				} else {
					prixAliment +=
						((Date.parse(DATE) -
							Date.parse(utilisation.date_debut)) *
							utilisation.valeurConsommee) /
						(Date.parse(utilisation.date_fin) -
							Date.parse(utilisation.date_debut));
				}
			});
		}
		// }
	});

	const amenagements = await Amenagement.find({ vagueId: vagueId });
	amenagements.forEach((amenagement) => {
		if (Date.parse(amenagement.created_at) <= Date.parse(DATE)) {
			prixAmenagement += amenagement.prix + amenagement.transport;
		}
	});

	const locations = await Location_Local.find({ vagueId: vagueId });
	locations.forEach((locationLocal) => {
		if (Date.parse(locationLocal.created_at) <= Date.parse(DATE)) {
			prixLocationLocal += locationLocal.prix + locationLocal.transport;
		}
	});

	const mainsOeuvres = await Main_Doeuvre.find({ vagueId: vagueId });
	mainsOeuvres.forEach((mainOeuvre) => {
		if (Date.parse(mainOeuvre.created_at) <= Date.parse(DATE)) {
			prixMainOeuvre += mainOeuvre.prix;
		}
	});

	const soins = await Soin_Medical.find({ vagueId: vagueId });
	soins.forEach(async (soinMedical) => {
		if (Date.parse(soinMedical.created_at) <= Date.parse(DATE)) {
			const soinsConsommes = await SoinsConsomme.find({
				soinsMedicalId: soinMedical._id,
			});
			soinsConsommes.forEach((consommation) => {
				if (
					Date.parse(consommation.date_consommation) <=
					Date.parse(DATE)
				) {
					prixSoinMedical += consommation.valeurConsommee;
				}
			});
		}
	});

	const eaux = await Eau.find({ vagueId: vagueId });
	eaux.forEach((eau) => {
		if (Date.parse(eau.created_at) <= Date.parse(DATE)) {
			prixEau += eau.prix;
		}
	});

	const electricites = await Electricite.find({ vagueId: vagueId });
	electricites.forEach((electricite) => {
		if (Date.parse(electricite.created_at) <= Date.parse(DATE)) {
			prixElectricite += electricite.prix;
		}
	});

	const autresDepenses = await Autre_Depense.find({ vagueId: vagueId });
	autresDepenses.forEach((autreDepense) => {
		if (Date.parse(autreDepense.created_at) <= Date.parse(DATE)) {
			prixAutreDepense += autreDepense.prix;
		}
	});

	const transportVentes = await Transport_Vente.find({ vagueId: vagueId });
	transportVentes.forEach((transportV) => {
		if (Date.parse(transportV.created_at) <= Date.parse(DATE)) {
			transportVente += transportV.prix;
		}
	});
	//retour de la somme de tous les prix
	return (
		prixVague +
		prixAmenagement +
		prixAliment +
		prixLocationLocal +
		prixMainOeuvre +
		prixSoinMedical +
		prixEau +
		prixElectricite +
		prixAutreDepense +
		transportVente
	);
};

//calculs de la sommes des prix
exports.sommeCoutDepensesParSujet = async (vagueId, DATE) => {
	let coutVague = 0;
	let coutConsommationAliment = 0;
	let coutAmenagement = 0;
	let coutLocationLocal = 0;
	let coutMainOeuvre = 0;
	let coutSoinMedical = 0;
	let coutEau = 0;
	let coutElectricite = 0;
	let coutAutreDepense = 0;
	let couttransportVente = 0;

	//recuperation des prix et les auto-sommer au cas où il en aurais plusieurs enregistrement dans la BD
	const vagues = await Vague.find({ _id: vagueId });
	vagues.forEach((vague) => {
		if (
			Date.parse(
				vague.date_arrive ? vague.date_arrive : vague.created_at
			) <= Date.parse(DATE)
		) {
			coutVague += vague.coutParSujet;
		}
	});

	const aliments = await Aliment.find({ vagueId: vagueId });
	aliments.forEach(async (aliment) => {
		// if (aliment.recyclage != "oui") {
		if (Date.parse(aliment.dateAchat) <= Date.parse(DATE)) {
			const alimentsUtilisees = await AlimentUtilise.find({
				alimentId: aliment._id,
			});
			alimentsUtilisees.forEach((utilisation) => {
				if (Date.parse(DATE) <= Date.parse(utilisation.date_debut)) {
					coutConsommationAliment += 0;
				} else if (
					Date.parse(DATE) >= Date.parse(utilisation.date_fin)
				) {
					coutConsommationAliment +=
						utilisation.valeurConsommeeParSujet;
				} else {
					coutConsommationAliment +=
						((Date.parse(DATE) -
							Date.parse(utilisation.date_debut)) *
							utilisation.valeurConsommeeParSujet) /
						(Date.parse(utilisation.date_fin) -
							Date.parse(utilisation.date_debut));
				}
			});
		}
		// }
	});

	const amenagements = await Amenagement.find({ vagueId: vagueId });
	amenagements.forEach((amenagement) => {
		if (Date.parse(amenagement.created_at) <= Date.parse(DATE)) {
			coutAmenagement += amenagement.coutParSujet;
		}
	});

	const locations = await Location_Local.find({ vagueId: vagueId });
	locations.forEach((locationLocal) => {
		if (Date.parse(locationLocal.created_at) <= Date.parse(DATE)) {
			coutLocationLocal += locationLocal.coutParSujet;
		}
	});

	const mainsOeuvres = await Main_Doeuvre.find({ vagueId: vagueId });
	mainsOeuvres.forEach((mainOeuvre) => {
		if (Date.parse(mainOeuvre.created_at) <= Date.parse(DATE)) {
			coutMainOeuvre += mainOeuvre.coutParSujet;
		}
	});

	const soins = await Soin_Medical.find({ vagueId: vagueId });
	soins.forEach(async(soinMedical) => {
		if (Date.parse(soinMedical.created_at) <= Date.parse(DATE)) {
			const soinsConsommes = await SoinsConsomme.find({
				soinsMedicalId: soinMedical._id,
			});
			soinsConsommes.forEach((consommation) => {
				if (
					Date.parse(consommation.date_consommation) <=
					Date.parse(DATE)
				) {
					coutSoinMedical += consommation.valeurConsommeeParSujet;
				}
			});
		}
	});

	const eaux = await Eau.find({ vagueId: vagueId });
	eaux.forEach((eau) => {
		if (Date.parse(eau.created_at) <= Date.parse(DATE)) {
			coutEau += eau.coutParSujet;
		}
	});

	const electricites = await Electricite.find({ vagueId: vagueId });
	electricites.forEach((electricite) => {
		if (Date.parse(electricite.created_at) <= Date.parse(DATE)) {
			coutElectricite += electricite.coutParSujet;
		}
	});

	const autresDepenses = await Autre_Depense.find({ vagueId: vagueId });
	autresDepenses.forEach((autreDepense) => {
		if (Date.parse(autreDepense.created_at) <= Date.parse(DATE)) {
			coutAutreDepense += autreDepense.coutParSujet;
		}
	});

	const transportVentes = await Transport_Vente.find({ vagueId: vagueId });
	transportVentes.forEach((transportV) => {
		if (Date.parse(transportV.created_at) <= Date.parse(DATE)) {
			couttransportVente += transportV.coutParSujet;
		}
	});
	//retour de la somme de tous les prix
	return (
		coutVague +
		coutConsommationAliment +
		coutAmenagement +
		coutLocationLocal +
		coutMainOeuvre +
		coutSoinMedical +
		coutEau +
		coutElectricite +
		coutAutreDepense +
		couttransportVente
	);
};

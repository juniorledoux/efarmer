import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { Offcanvas } from "react-bootstrap";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import LocalStorage from "localStorage";
import Popup from "reactjs-popup";
import Axios from "axios";
import {
	Provider as AlertProvider,
	useAlert,
	positions,
	types,
	transitions,
} from "react-alert";
import ClipLoader from "react-spinners/ClipLoader";

function RapportVague(props) {
	const [VAGUEID, setVagueId] = useState(props.vagueId);
	const [vague, setVague] = useState({});
	const [valeurActu, setValeurActu] = useState(0);

	const [alimentMtnt, setAlimentMtnt] = useState({});
	const [animauxMtnt, setAnimauxMtnt] = useState({});
	const [amenagementMtnt, setAmenagementMtnt] = useState({});
	const [eauxMtnt, setEauxMtnt] = useState({});
	const [electricitesMtnt, setElectricitesMtnt] = useState({});
	const [locations_locauxMtnt, setLocationsLocauxMtnt] = useState({});
	const [mains_DoeuvreMtnt, setMainsDoeuvreMtnt] = useState({});
	const [soins_medicauxMtnt, setSoinsMedicauxMtnt] = useState({});
	const [transports_VentesMtnt, setTransportsVentesMtnt] = useState({});
	const [autres_depensesMtnt, setAutresDepensesMtnt] = useState({});

	const [resultat, setResultat] = useState(0);
	const [quantitePerdu, setQuantitePerdu] = useState(0);
	const [montantPerdu, setMontantPerdu] = useState(0);

	const [montantAlimentUtilise, setMontantAlimentUtilise] = useState(0);
	const [quantiteAlimentUtilise, setQuantiteAlimentUtilise] = useState(0);
	const [montantAlimentRestant, setMontantAlimentRestant] = useState(0);
	const [quantiteAlimentRestant, setQuantiteAlimentRestant] = useState(0);

	const [date_arrive, setDateArrive] = useState("");

	const [loading, setLoading] = useState(false);
	const Alert = useAlert();

	const showAlertSuccess = (msg) => {
		Alert.show(msg, {
			type: types.SUCCESS,
		});
	};
	const showAlertError = (msg) => {
		Alert.show(msg, {
			type: types.ERROR,
		});
	};

	const makeRapportVague = () => {
		setLoading(true);
		Axios.post("/api/rapport_vague", {
			vagueId: VAGUEID,
			//prix
			total_depenses_animaux: animauxMtnt.prix_animaux,
			total_depenses_aliments: alimentMtnt.prix,
			total_depenses_soins_medicaux: soins_medicauxMtnt.prix,
			total_depenses_amenagements: amenagementMtnt.prix,
			total_depenses_location_local: locations_locauxMtnt.prix,
			total_depenses_main_doeuvre: mains_DoeuvreMtnt.prix,
			total_depenses_electricite: electricitesMtnt.prix,
			total_depenses_eau: eauxMtnt.prix,
			total_depenses_autres_depenses: autres_depensesMtnt.prix,
			//quantite
			total_quantite_animaux: animauxMtnt.quantite,
			total_quantite_aliments: alimentMtnt.quantite,
			total_quantite_soins_medicaux: soins_medicauxMtnt.quantite,
			total_quantite_amenagements: amenagementMtnt.quantite,
			//transport
			total_depenses_transport_vente: transports_VentesMtnt.prix,
			total_transport_animaux: animauxMtnt.transport,
			total_transport_aliments: alimentMtnt.transport,
			total_transport_soins_medicaux: soins_medicauxMtnt.transport,
			total_transport_amenagements: amenagementMtnt.transport,
			total_transport_location_local: locations_locauxMtnt.transport,
			//global
			total_budget: vague.budget_prevu,
			total_ventes: vague.NbreSujet_vendu * vague.prixMoyenVente_sujet,
			total_quantite_ventes: vague.NbreSujet_vendu,
			resultat: resultat,
			total_pertes: montantPerdu,
			total_quantite_pertes: quantitePerdu,
			total_reformes: vague.enStock,
			total_quantite_aliment_restant: quantiteAlimentRestant,
			total_valeur_aliment_restant: montantAlimentRestant,
			total_quantite_aliment_consommée: quantiteAlimentUtilise,
			total_valeur_aliment_consommée: montantAlimentUtilise,
			//dates
			date_arrive: vague.date_arrive,
		})
			.then((response) => {
				getVague();
				getVagues();
				if (response.status === 201)
					showAlertSuccess(response.data.message);
				else showAlertError("Verifiez vos champs et recommencez");
				setLoading(false);
			})
			.catch((error) => {
				showAlertError(error.response.data.message);
				setLoading(false);
			});
	};

	const makeReforme = () => {
		setLoading(true);
		if (vague.enStock != 0) {
			Axios.post("/api/customers/vague", {
				titre: "Réformés de " + vague.titre,
				qte_animaux: vague.enStock,
				prix_unitaire: valeurActu,
				fournisseur: vague.fournisseur,
				fournisseurId: vague.fournisseurId,
				date_arrive: new Date().toDateString(),
				animaux_perdu: 0,
				transport: 0,
				etat: 0,
				age_sujet: vague.age_sujet,
				poidsMoyen_sujet: vague.poidsMoyen_sujet,
				NbreSujet_vendu: 0,
				prixMoyenVente_sujet: 0,
				enStock: vague.enStock,
				budget_prevu: 0,
				benef_attendu: 0,
				facture: "Aucune facture",
			})
				.then((response) => {
					getVagues();
					getVague();
					if (response.status === 201)
						showAlertSuccess(
							"Vague de réformés ajoutée avec succès"
						);
					else showAlertError("Verifiez vos champs et recommencez");
					setLoading(false);
				})
				.catch((error) => {
					showAlertError(error.response.data.message);
					setLoading(false);
				});
		}
	};

	const getVague = () => {
		getCurrentVague(props.vagueList);
		Axios.get(`api/customers/vague/${VAGUEID}`)
			.then((res) => {
				if (res.status === 200) {
					setVague(res.data);
					getAlimentPrix();
					getAnimalPrix();
					getAmenagementPrix();
					getEauPrix();
					getElectricitePrix();
					getLocationLocalPrix();
					getTransportVentePrix();
					getMainOeuvrePrix();
					getSoinMedicalPrix();
					getAutreDepensePrix();
					getBenefSurVente();
					getPertes();
					getAliments();
					getValeurActu();
				}
			})
			.catch((error) => {
				setLoading(false);
			});
	};

	useEffect(() => {
		getVague();
	}, [props.vagueList]);

	const getCurrentVague = (vagueList) => {
		let v = {};
		vagueList.forEach((vague) => {
			if (vague._id == VAGUEID) {
				v = vague;
			}
		});
		setVague(v);
	};

	const getAlimentPrix = () => {
		Axios.get(`api/cout/aliment/${VAGUEID}`).then((res) => {
			if (res.status === 200) {
				setAlimentMtnt(res.data);
			}
		});
	};
	const getAnimalPrix = () => {
		Axios.get(`api/cout/vague/${VAGUEID}`).then((res) => {
			if (res.status === 200) {
				setAnimauxMtnt(res.data);
			}
		});
	};
	const getAmenagementPrix = () => {
		Axios.get(`api/cout/amenagement/${VAGUEID}`).then((res) => {
			if (res.status === 200) {
				setAmenagementMtnt(res.data);
			}
		});
	};
	const getEauPrix = () => {
		Axios.get(`api/cout/eau/${VAGUEID}`).then((res) => {
			if (res.status === 200) {
				setEauxMtnt(res.data);
			}
		});
	};
	const getElectricitePrix = () => {
		Axios.get(`api/cout/electricite/${VAGUEID}`).then((res) => {
			if (res.status === 200) {
				setElectricitesMtnt(res.data);
			}
		});
	};
	const getLocationLocalPrix = () => {
		Axios.get(`api/cout/location_local/${VAGUEID}`).then((res) => {
			if (res.status === 200) {
				setLocationsLocauxMtnt(res.data);
			}
		});
	};
	const getMainOeuvrePrix = () => {
		Axios.get(`api/cout/main_doeuvre/${VAGUEID}`).then((res) => {
			if (res.status === 200) {
				setMainsDoeuvreMtnt(res.data);
			}
		});
	};
	const getSoinMedicalPrix = () => {
		Axios.get(`api/cout/soin_medical/${VAGUEID}`).then((res) => {
			if (res.status === 200) {
				setSoinsMedicauxMtnt(res.data);
			}
		});
	};
	const getTransportVentePrix = () => {
		Axios.get(`api/cout/transport_vente/${VAGUEID}`).then((res) => {
			if (res.status === 200) {
				setTransportsVentesMtnt(res.data);
			}
		});
	};
	const getAutreDepensePrix = () => {
		Axios.get(`api/cout/autre_depense/${VAGUEID}`).then((res) => {
			if (res.status === 200) {
				setAutresDepensesMtnt(res.data);
			}
		});
	};

	const getBenefSurVente = () => {
		Axios.get(`api/results/benef_sur_vente/${VAGUEID}`).then((res) => {
			if (res.status === 200) {
				setResultat(res.data.benefSurVente);
			}
		});
	};

	const getPertes = () => {
		let qte = 0;
		let mtnt = 0;
		Axios.get(`/api/perte/all/${VAGUEID}`).then((response) => {
			response.data.pertes.forEach((perte) => {
				qte += perte.qte_perdu;
				mtnt += perte.valeur_perdu;
			});
			setQuantitePerdu(qte);
			setMontantPerdu(mtnt);
		});
	};

	const getAliments = () => {
		let qteUtilise = 0;
		let valUtilise = 0;
		let qteRestante = 0;
		let valRestante = 0;
		Axios.get(`/api/aliments/all/${VAGUEID}`).then((response) => {
			response.data.forEach((aliment) => {
				qteUtilise += aliment.qteUtilise;
				valUtilise += aliment.valeurQteUtilise;
			});
			qteRestante = alimentMtnt.quantite - qteUtilise;
			valRestante = alimentMtnt.prix + alimentMtnt.transport - valUtilise;
			setQuantiteAlimentUtilise(qteUtilise);
			setMontantAlimentUtilise(valUtilise);
			setQuantiteAlimentRestant(qteRestante);
			setMontantAlimentRestant(valRestante);
		});
	};

	const getValeurActu = () => {
		Axios.get(`api/results/valeur_actu/${VAGUEID}`).then((res) => {
			if (res.status === 200) {
				setValeurActu(res.data.valeurActuelle);
			}
		});
	};

	const demarrerVague = (id) => {
		if (date_arrive == "") {
			return showAlertError(
				"Veuillez entrer la date d'arrivée des sujets"
			);
		}
		if (
			new Date(date_arrive).getTime() >
			new Date(new Date().toDateString()).getTime()
		)
			return showAlertError("Veuilleéz entrer une date passée valide");
		else {
			setLoading(true);
			Axios.put(`/api/customers/vague/${id}`, {
				etat: 1,
				date_arrive: new Date(date_arrive).toDateString(),
				_id: id,
			})
				.then((response) => {
					if (response.status === 201) {
						getVagues();
						getVague();
						showAlertSuccess("Vague démarrée !");
					}
					setLoading(false);
				})
				.catch((error) => {
					showAlertError(error.response.data.message);
					setLoading(false);
				});
		}
	};
	const stopperVague = (id) => {
		setLoading(true);
		Axios.put(`/api/customers/vague/${id}`, {
			etat: 2,
			stoppe_le: new Date().toDateString(),
			_id: id,
		})
			.then((response) => {
				if (response.status === 201) {
					getVagues();
					getVague();
					showAlertSuccess("Vague stoppée !");
				}
				setLoading(false);
			})
			.catch((error) => {
				showAlertError(error.response.data.message);
				setLoading(false);
			});
	};

	const getVagues = () => {
		Axios.get(`/api/customers/vague`).then((response) => {
			LocalStorage.setItem("vagueList", JSON.stringify(response.data));
			props.setVagueList(response.data);
		});
	};

	const render = () => {
		if (vague.etat == 0) {
			return (
				<span>
					<a
						className="fs-3 p-2"
						data-bs-target="#simulation"
						data-bs-toggle="modal"
						data-bs-dismiss="modal"
						style={{
							fontWeight: "bold",
						}}
					>
						<i class="tim-icons icon-triangle-right-17 text-success font-weight-bold mx-2"></i>
					</a>
					<div
						id="simulation"
						class="modal fade text-dark"
						aria-hidden="true"
						aria-labelledby="simulationLabel"
						tabindex="-1"
						data-bs-backdrop="static"
						data-bs-keyboard="false"
					>
						<div
							class="modal-dialog modal-dialog-centered modal-md modal-dialog-scrollable"
							style={{ margin: "auto", marginTop: "30px" }}
						>
							<div class="modal-content">
								<div class="modal-header">
									<h5
										class="modal-title"
										id="simulationLabel"
									>
										Démarrage de la vague {vague.titre}.
									</h5>
									<button
										class="btn-close"
										type="button"
										data-bs-dismiss="modal"
										aria-label="Close"
									></button>
								</div>
								<div class="modal-body">
									<div className="form-group">
										<label>
											Date d'arrivée des sujets{" "}
											<span
												style={{
													fontWeight: "bold",
													color: "red",
												}}
											>
												*
											</span>
										</label>
										<input
											required
											type="date"
											onChange={(event) => {
												setDateArrive(
													event.target.value
												);
											}}
											className="form-control"
											value={date_arrive}
											placeholder="Entrez la date réelle d'arrivée des sujets"
											title="Entrez la date réelle d'arrivée des sujets"
										/>
									</div>
								</div>
								<div class="modal-footer">
									<button
										className="btn btn-outline-success m-auto btn-fw"
										data-bs-dismiss="modal"
										aria-label="Close"
										onClick={() => {
											demarrerVague(VAGUEID);
										}}
									>
										{" "}
										Démarrer
									</button>
								</div>
							</div>
						</div>
					</div>
				</span>
			);
		} else if (vague.etat == 1) {
			return (
				<Popup
					trigger={
						<a
							className="fs-3 p-2"
							style={{
								fontWeight: "bold",
							}}
						>
							<i class="tim-icons font-weight-bold text-warning icon-button-pause mx-2"></i>
						</a>
					}
					position="left center"
				>
					{(close) => (
						<div className="p-2">
							<p>
								<span className="text-danger font-weight-bold">
									{" "}
									Attention ! stopper une vague encours
									empêchera toute manipulation et entraînera
									la création d'une nouvelle vague avec les
									restes de sujet de celle-ci.
								</span>
								<br />
								Confirmer l'arret de la vague ?
							</p>
							<button
								onClick={() => {
									stopperVague(VAGUEID);
									makeRapportVague();
									if (vague.enStock != 0) {
										makeReforme();
									}
								}}
								className="btn btn-warning"
							>
								Oui
							</button>
							<button
								style={{
									marginLeft: "10px",
								}}
								className="btn btn-success"
								onClick={close}
							>
								Non
							</button>
						</div>
					)}
				</Popup>
			);
		} else if (vague.etat == 2) {
			return (
				<Link
					to={`/pages/vagues/${VAGUEID}/rapport`}
					className="fs-3 p-2"
					style={{
						fontWeight: "bold",
					}}
				>
					<i class="tim-icons icon-badge text-primary font-weight-bold mx-2"></i>
				</Link>
			);
		}
	};

	return (
		<span className="">
			{render()}
			{loading ? (
				<div
					className="d-flex justify-content-center align-items-center"
					style={{
						width: "100%",
						height: "100%",
						position: "fixed",
						top: "0",
						left: "0",
						zIndex: 1210,
						background: "#000",
						opacity: 0.5,
					}}
				>
					<ClipLoader
						color={"#0a58ca"}
						loading={loading}
						size={135}
						aria-label="Loading Spinner"
						data-testid="loader"
					/>
				</div>
			) : (
				""
			)}
		</span>
	);
}

export default RapportVague;

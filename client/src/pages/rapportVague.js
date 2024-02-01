import React, { useState, useEffect } from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Link,
	Navigate,
} from "react-router-dom";
import NavBar from "../components/utils/navBar";
import "../components/dashboard.css";
import "../components/assets/css/nucleo-icons.css";
import "reactjs-popup/dist/index.css";
import Axios from "axios";
import moment from "moment";
import Popup from "reactjs-popup";
import Chart from "chart.js/auto";
import bootstrap from "bootstrap";
import { Line, Bar } from "react-chartjs-2";
import NumberFormat from "react-number-format";
import LocalStorage from "localStorage";
import {
	Provider as AlertProvider,
	useAlert,
	positions,
	types,
	transitions,
} from "react-alert";
import ClipLoader from "react-spinners/ClipLoader";
import RapportVente from "../components/vagueRapportComponent/rapportVente";
import RapportPerte from "../components/vagueRapportComponent/rapportPerte";
import RapportQuantiteVente from "../components/vagueRapportComponent/rapportQuantiteVente";
import RapportVagueModeEncaissementVente from "../components/vagueRapportComponent/rapportModeEncaissementVente";
import RapportVagueModePaiementVente from "../components/vagueRapportComponent/rapportModePaiementVente";
import RapportProfits from "../components/vagueRapportComponent/rapportProfits";
import { useParams } from "react-router-dom";

function PageRapportVague() {
	const { vagueId } = useParams();
	const [vagueList, setVagueList] = useState(
		JSON.parse(LocalStorage.getItem("vagueList"))
			? JSON.parse(LocalStorage.getItem("vagueList"))
			: []
	);
	const [rapportVague, setRapportVague] = useState(
		JSON.parse(LocalStorage.getItem("rapportVague")) &&
			JSON.parse(LocalStorage.getItem("rapportVague")).vagueId == vagueId
			? JSON.parse(LocalStorage.getItem("rapportVague"))
			: {}
	);
	const [vague, setVague] = useState({});
	const [depenseActu, setDepenseActu] = useState();
	const [resultat, setResultat] = useState();
	const [alimentList, setAlimentList] = useState([]);
	const [acheter, setAcheter] = useState(0);
	const [reutiliser, setReutiliser] = useState(0);
	const [soin_medicalList, setSoin_medicalList] = useState([]);
	const [main_deouvreList, setMain_DeouvreList] = useState([]);
	const [eauList, setEauList] = useState([]);
	const [electriciteList, setElectriciteList] = useState([]);
	const [amenagementList, setAmenagementList] = useState([]);
	const [location_localList, setLocation_localList] = useState([]);
	const [transport_venteList, setTransport_venteList] = useState([]);
	const [autreDepenseList, setAutreDepenseList] = useState([]);
	const [venteList, setVenteList] = useState(
		JSON.parse(LocalStorage.getItem("venteList")) &&
			JSON.parse(LocalStorage.getItem("venteList")).length != 0 &&
			JSON.parse(LocalStorage.getItem("venteList"))[0].vagueId == vagueId
			? JSON.parse(LocalStorage.getItem("venteList"))
			: []
	);
	const [loading, setLoading] = useState(false);
	const [active, setActive] = useState(["active", "", ""]);
	const [options, setOptions] = useState({
		plugins: {
			title: {
				display: true,
				text: "Rapport Budget prévu / Dépenses éffectuées",
			},
			legend: {
				display: false,
			},
		},
	});
	const [chartData, setChartData] = useState({
		labels: [],
		datasets: [
			{
				label: "Montant ",
				data: [],
			},
		],
	});

	useEffect(() => {
		getRapportVague();
		getVentes();
		getVague(vagueList);
	}, []);

	useEffect(() => {
		setChartData({
			labels: [
				"Sujets",
				"Aliments",
				"Médicaments",
				"Main d'oeuvre",
				"Eau",
				"Electricité",
				"Aménagements",
				"Location du local",
				"Charges de livraison",
				"Autres dépenses",
			],
			datasets: [
				{
					label: "Budget prévu ",
					data: [
						vague.budget_animaux,
						vague.budget_aliments,
						vague.budget_soins_medicaux,
						vague.budget_main_doeuvre,
						vague.budget_eau,
						vague.budget_electricite,
						vague.budget_amenagements,
						vague.budget_location_local,
						vague.budget_transport_vente,
						vague.budget_autres_depenses,
					],
					backgroundColor: [
						"#4B49AC",
						"#FF4747",
						"#57B657",
						"#282f3a",
						"#248AFD",
						"#FFC100",
						"#6a008a",
						"#58d8a3",
						"#aab2bd",
						"#E91E63",
					],
				},
				{
					label: "Dépense éffectuée ",
					data: [
						rapportVague.total_depenses_animaux,
						rapportVague.total_depenses_aliments,
						rapportVague.total_depenses_soins_medicaux,
						rapportVague.total_depenses_main_doeuvre,
						rapportVague.total_depenses_eau,
						rapportVague.total_depenses_electricite,
						rapportVague.total_depenses_amenagements,
						rapportVague.total_depenses_location_local,
						rapportVague.total_depenses_transport_vente,
						rapportVague.total_depenses_autres_depenses,
					],
					backgroundColor: [
						"#4B49AC",
						"#FF4747",
						"#57B657",
						"#282f3a",
						"#248AFD",
						"#FFC100",
						"#6a008a",
						"#58d8a3",
						"#aab2bd",
						"#E91E63",
					],
				},
			],
		});
	}, [vagueId, rapportVague, vague]);

	const getVentes = () => {
		Axios.get(`/api/vente/all/${vagueId}`).then((response) => {
			if (response.status === 200) {
				LocalStorage.setItem(
					"venteList",
					JSON.stringify(response.data.ventes)
				);
				setVenteList(response.data.ventes);
			}
		});
	};

	const getRapportVague = () => {
		if (!rapportVague) setLoading(true);
		Axios.get(`api/rapport_vague/${vagueId}`)
			.then((res) => {
				if (res.status === 200) {
					LocalStorage.setItem(
						"rapportVague",
						JSON.stringify(res.data)
					);
					setRapportVague(res.data);
					getDepensesActu();
					getResultat();
					getAliments();
					getSoin_medical();
					getMain_deouvre();
					getEaux();
					getElectricite();
					getAmenage();
					getLocation_local();
					getTransport_vente();
					getAutreDepenses();
				}
				setLoading(false);
			})
			.catch(() => {
				setLoading(false);
				showAlertError(error.response.data.message);
			});
	};

	const getVague = (vagueList) => {
		let v = {};
		vagueList.forEach((vague) => {
			if (vague._id == vagueId) {
				v = vague;
			}
		});
		setVague(v);
	};

	const getAliments = () => {
		let achat = 0;
		let reutilisation = 0;
		Axios.get(`/api/aliments/all/${vagueId}`).then((response) => {
			setAlimentList(response.data);
			response.data.forEach((aliment) => {
				if (aliment.recyclage == "oui") {
					reutilisation += aliment.prix;
				}
				if (aliment.recyclage != "oui") {
					achat += aliment.prix;
				}
			});
			setAcheter(achat);
			setReutiliser(reutilisation);
		});
	};

	const getSoin_medical = () => {
		Axios.get(`/api/soin_medical/all/${vagueId}`).then((response) => {
			setSoin_medicalList(response.data);
		});
	};

	const getMain_deouvre = () => {
		Axios.get(`/api/main_doeuvre/all/${vagueId}`).then((response) => {
			setMain_DeouvreList(response.data);
		});
	};

	const getEaux = () => {
		Axios.get(`/api/eau/all/${vagueId}`).then((response) => {
			setEauList(response.data);
		});
	};

	const getElectricite = () => {
		Axios.get(`/api/electricite/all/${vagueId}`).then((response) => {
			setElectriciteList(response.data);
		});
	};

	const getAmenage = () => {
		Axios.get(`/api/amenagement/all/${vagueId}`).then((response) => {
			setAmenagementList(response.data);
		});
	};

	const getLocation_local = () => {
		Axios.get(`/api/location_local/all/${vagueId}`).then((response) => {
			setLocation_localList(response.data);
		});
	};

	const getTransport_vente = () => {
		Axios.get(`/api/transport_vente/all/${vagueId}`).then((response) => {
			setTransport_venteList(response.data);
		});
	};

	const getAutreDepenses = () => {
		Axios.get(`/api/autre_depense/all/${vagueId}`).then((response) => {
			setAutreDepenseList(response.data);
		});
	};

	const getDepensesActu = () => {
		Axios.get(`api/results/depenses_actu/${vagueId}`).then((res) => {
			if (res.status === 200) {
				setDepenseActu(res.data.depenseActuelle);
			}
		});
	};
	const getResultat = () => {
		Axios.get(`api/results/benef_sur_vente/${vagueId}`).then((res) => {
			if (res.status === 200) {
				setResultat(res.data.benefSurVente);
			}
		});
	};

	const change1 = () => {
		setActive(["active", "", ""]);
		setOptions({
			plugins: {
				title: {
					display: true,
					text: "Rapport Budget prévu / Dépenses éffectuées",
				},
				legend: {
					display: false,
				},
			},
		});
		setChartData({
			labels: [
				"Sujets",
				"Aliments",
				"Médicaments",
				"Main d'oeuvre",
				"Eau",
				"Electricité",
				"Aménagements",
				"Location du local",
				"Charges de livraison",
				"Autres dépenses",
			],
			datasets: [
				{
					label: "Budget prévu ",
					data: [
						vague.budget_animaux,
						vague.budget_aliments,
						vague.budget_soins_medicaux,
						vague.budget_main_doeuvre,
						vague.budget_eau,
						vague.budget_electricite,
						vague.budget_amenagements,
						vague.budget_location_local,
						vague.budget_transport_vente,
						vague.budget_autres_depenses,
					],
					backgroundColor: [
						"#4B49AC",
						"#FF4747",
						"#57B657",
						"#282f3a",
						"#248AFD",
						"#FFC100",
						"#6a008a",
						"#58d8a3",
						"#aab2bd",
						"#E91E63",
					],
				},
				{
					label: "Dépense éffectuée ",
					data: [
						rapportVague.total_depenses_animaux,
						rapportVague.total_depenses_aliments,
						rapportVague.total_depenses_soins_medicaux,
						rapportVague.total_depenses_main_doeuvre,
						rapportVague.total_depenses_eau,
						rapportVague.total_depenses_electricite,
						rapportVague.total_depenses_amenagements,
						rapportVague.total_depenses_location_local,
						rapportVague.total_depenses_transport_vente,
						rapportVague.total_depenses_autres_depenses,
					],
					backgroundColor: [
						"#4B49AC",
						"#FF4747",
						"#57B657",
						"#282f3a",
						"#248AFD",
						"#FFC100",
						"#6a008a",
						"#58d8a3",
						"#aab2bd",
						"#E91E63",
					],
				},
			],
		});
	};

	const change2 = () => {
		setActive(["", "active", ""]);
		setOptions({
			plugins: {
				title: {
					display: true,
					text: "Statistiques des transport éffectués",
				},
				legend: {
					display: false,
				},
			},
		});
		setChartData({
			labels: [
				"Sujets",
				"Aliments",
				"Médicaments",
				"Aménagements",
				"Location du local",
			],
			datasets: [
				{
					label: "Transport pour achat ",
					data: [
						rapportVague.total_transport_animaux,
						rapportVague.total_transport_aliments,
						rapportVague.total_transport_soins_medicaux,
						rapportVague.total_transport_amenagements,
						rapportVague.total_transport_location_local,
					],
					backgroundColor: [
						"#6a008a",
						"#E91E63",
						"#57B657",
						"#248AFD",
						"#FFC100",
					],
				},
			],
		});
	};

	const change3 = () => {
		setActive(["", "", "active"]);
		setOptions({
			plugins: {
				title: {
					display: true,
					text: "Statistiques des quantités achétées",
				},
				legend: {
					display: false,
				},
			},
		});
		setChartData({
			labels: ["Sujets", "Aliments", "Médicaments", "Aménagements"],
			datasets: [
				{
					label: "Quantité achétée ",
					data: [
						rapportVague.total_quantite_animaux,
						rapportVague.total_quantite_aliments,
						rapportVague.total_quantite_soins_medicaux,
						rapportVague.total_quantite_amenagements,
					],
					backgroundColor: [
						"#6a008a",
						"#E91E63",
						"#57B657",
						"#248AFD",
					],
				},
			],
		});
	};

	return (
		<div>
			<NavBar
				VAGUEID={vagueId}
				vagueList={vagueList}
				funtionToUpdate={getRapportVague}
			/>
			<div className="p-0 col-lg-12">
				<div className="container-fluid page-body-wrapper">
					<div className="main-panel" style={{ width: "100%" }}>
						<div
							style={{
								padding: "30px",
								backgroundColor: "#f5f7ff",
								height: "100%",
							}}
						>
							{/* <h2 className="text-center bg-primary rounded text-white p-2 col-lg-7 mt-2 mx-auto">
								RAPPORT DE FIN DE VAGUE
							</h2> */}
							<div
								style={{
									marginTop: "0px",
									marginBottom: "45px",
								}}
							>
								<div className="chart-container">
									<div class="card card-chart my-3">
										<div class="card-header">
											<div className="row justify-content-center">
												<div className="col-lg-4">
													<h5 class="card-category">
														<strong>
															<i class="tim-icons icon-button-power text-success mx-2"></i>
														</strong>
														Début de la vague :
													</h5>
													<h3 class="card-title mx-4">
														{/* {moment(
									new Date(rapportVague.date_arrive)
								).format("DD/MM/YYYY")} */}
														{new Date(
															rapportVague.date_arrive
														).toDateString()}
													</h3>
												</div>
												<div className="col-lg-4">
													<h5 class="card-category">
														<strong>
															<i class="tim-icons icon-button-power text-danger mx-2"></i>
														</strong>
														Fin de la vague :{" "}
													</h5>
													<h3 class="card-title mx-4">
														{new Date(
															rapportVague.created_at
														).toDateString()}
													</h3>
												</div>
											</div>
										</div>
									</div>

									<div class="row align-items-center">
										<div class="col-lg-4">
											<RapportVente
												rapportVague={rapportVague}
												vagueId={vagueId}
												allVenteList={venteList}
											/>
										</div>
										<div class="col-lg-4">
											<RapportQuantiteVente
												rapportVague={rapportVague}
												vagueId={vagueId}
												allVenteList={venteList}
											/>
										</div>
										<div class="col-lg-4">
											<RapportPerte
												rapportVague={rapportVague}
												vagueId={vagueId}
											/>
										</div>
									</div>
									<div class="row align-items-center">
										<div class="col-lg-4">
											<RapportVagueModeEncaissementVente
												rapportVague={rapportVague}
												vagueId={vagueId}
												allVenteList={venteList}
											/>
										</div>
										<div class="col-lg-4">
											<RapportVagueModePaiementVente
												rapportVague={rapportVague}
												vagueId={vagueId}
												allVenteList={venteList}
											/>
										</div>

										<div class="col-lg-4">
											<RapportProfits vagueId={vagueId} />
										</div>
									</div>

									<div class="row mb-3">
										<div class="col-lg-12">
											<div class="card card-chart">
												<div class="card-header ">
													<div class="row">
														<div class="col-lg-6 text-left">
															<div class="row">
																<div class="col-sm-4 text-left">
																	<h5 class="card-category">
																		Total
																		Budget
																	</h5>
																	<h2 class="card-title">
																		<i class="tim-icons icon-wallet-43 text-primary"></i>{" "}
																		<NumberFormat
																			value={
																				vague.budget_prevu
																			}
																			displayType={
																				"text"
																			}
																			thousandSeparator={
																				true
																			}
																			decimalScale={
																				true
																			}
																			suffix={
																				" XAF"
																			}
																		/>
																	</h2>
																</div>
																<div class="col-sm-4 text-left">
																	<h5 class="card-category">
																		Total
																		Dépenses
																	</h5>
																	<h2 class="card-title">
																		<i class="tim-icons icon-chart-pie-36 text-danger"></i>{" "}
																		<NumberFormat
																			value={
																				depenseActu
																			}
																			displayType={
																				"text"
																			}
																			thousandSeparator={
																				true
																			}
																			decimalScale={
																				true
																			}
																			suffix={
																				" XAF"
																			}
																		/>
																	</h2>
																</div>
																<div class="col-sm-4 text-left">
																	<h5 class="card-category">
																		Resultat
																	</h5>
																	<h2 class="card-title">
																		{resultat >
																		0 ? (
																			<strong className="text-success">
																				<i class="tim-icons icon-chart-bar-32 text-success"></i>{" "}
																				{
																					<NumberFormat
																						value={
																							resultat
																						}
																						displayType={
																							"text"
																						}
																						thousandSeparator={
																							true
																						}
																						decimalScale={
																							true
																						}
																						suffix={
																							" XAF"
																						}
																					/>
																				}
																			</strong>
																		) : (
																			<strong className="text-danger">
																				<i class="tim-icons icon-chart-bar-32 text-danger"></i>{" "}
																				{
																					<NumberFormat
																						value={
																							resultat
																						}
																						displayType={
																							"text"
																						}
																						thousandSeparator={
																							true
																						}
																						decimalScale={
																							true
																						}
																						suffix={
																							" XAF"
																						}
																					/>
																				}
																			</strong>
																		)}
																	</h2>
																</div>
															</div>
														</div>
														<div class="col-lg-6">
															<div
																class="btn-group btn-group-toggle float-right"
																data-toggle="buttons"
															>
																<label
																	class={`btn btn-sm btn-primary btn-simple ${active[0]}`}
																	id="0"
																	onClick={() => {
																		change1();
																	}}
																>
																	<input
																		type="radio"
																		name="options"
																		checked
																	/>
																	<span class="d-none d-sm-block d-md-block d-lg-block d-xl-block">
																		Rapport
																	</span>
																	<span class="d-block d-sm-none">
																		<i class="tim-icons icon-chart-bar-32"></i>
																	</span>
																</label>
																<label
																	class={`btn btn-sm btn-primary btn-simple ${active[1]}`}
																	id="1"
																	onClick={() => {
																		change2();
																	}}
																>
																	<input
																		type="radio"
																		class="d-none d-sm-none"
																		name="options"
																	/>
																	<span class="d-none d-sm-block d-md-block d-lg-block d-xl-block">
																		Transports
																	</span>
																	<span class="d-block d-sm-none">
																		<i class="tim-icons icon-delivery-fast"></i>
																	</span>
																</label>
																<label
																	class={`btn btn-sm btn-primary btn-simple ${active[2]}`}
																	id="2"
																	onClick={() => {
																		change3();
																	}}
																>
																	<input
																		type="radio"
																		class="d-none"
																		name="options"
																	/>
																	<span class="d-none d-sm-block d-md-block d-lg-block d-xl-block">
																		Quantités
																	</span>
																	<span class="d-block d-sm-none">
																		<i class="tim-icons icon-chart-pie-36"></i>
																	</span>
																</label>
															</div>
														</div>
													</div>
												</div>
												<div class="card-body">
													<div class="chart-area">
														<Bar
															data={chartData}
															height={
																window.outerWidth <
																500
																	? "600px"
																	: "auto"
															}
															width={
																window.outerWidth >
																500
																	? "500px"
																	: "auto"
															}
															options={options}
														/>
													</div>
												</div>
												<div className="card-footer">
													<div
														class="accordion"
														id="accordionExample"
													>
														<div class="accordion-item">
															<h2
																class="accordion-header"
																id="heading1"
															>
																<button
																	class="accordion-button"
																	type="button"
																	data-bs-toggle="collapse"
																	data-bs-target="#collapse1"
																	aria-expanded="true"
																	aria-controls="collapse1"
																>
																	Détails de
																	la vague.
																</button>
															</h2>
															<div
																id="collapse1"
																class="accordion-collapse collapse"
																aria-labelledby="heading1"
																data-bs-parent="#accordionExample"
															>
																<div
																	class="accordion-body"
																	style={{
																		overflow:
																			"auto",
																	}}
																>
																	<table className="table table-striped">
																		<tbody>
																			<tr
																				key={
																					vague._id
																				}
																			>
																				<td className="text-center">
																					{
																						vague.titre
																					}
																				</td>
																				<td className="text-center">
																					{" "}
																					<NumberFormat
																						value={
																							vague.qte_animaux
																						}
																						displayType={
																							"text"
																						}
																						thousandSeparator={
																							true
																						}
																						decimalScale={
																							true
																						}
																						suffix={
																							" Sujets"
																						}
																					/>{" "}
																					X{" "}
																					<NumberFormat
																						value={Math.round(
																							vague.prix_animaux /
																								vague.qte_animaux
																						)}
																						displayType={
																							"text"
																						}
																						thousandSeparator={
																							true
																						}
																						decimalScale={
																							true
																						}
																						suffix={
																							" XAF"
																						}
																					/>
																				</td>
																				<td className="text-center">
																					chez{" "}
																					{
																						vague.fournisseur
																					}
																				</td>
																				<td className="text-center">
																					age:{" "}
																					<strong>
																						<NumberFormat
																							value={
																								vague.age_sujet
																							}
																							displayType={
																								"text"
																							}
																							thousandSeparator={
																								true
																							}
																							decimalScale={
																								true
																							}
																							suffix={
																								" Jours"
																							}
																						/>
																					</strong>
																				</td>
																			</tr>
																		</tbody>
																	</table>
																</div>
															</div>
														</div>
														<div class="accordion-item">
															<h2
																class="accordion-header"
																id="headingTwo"
															>
																<button
																	class="accordion-button collapsed"
																	type="button"
																	data-bs-toggle="collapse"
																	data-bs-target="#collapseTwo"
																	aria-expanded="false"
																	aria-controls="collapseTwo"
																>
																	Voir les
																	achats
																	d'aliments.
																</button>
															</h2>
															<div
																id="collapseTwo"
																class="accordion-collapse collapse"
																aria-labelledby="headingTwo"
																data-bs-parent="#accordionExample"
															>
																<div
																	class="accordion-body"
																	style={{
																		height: "200px",
																		overflow:
																			"auto",
																	}}
																>
																	{alimentList.length !=
																	0 ? (
																		<div className="text-center mb-2 d-flex justify-content-evenly">
																			<div className="">
																				<i
																					class="tim-icons icon-cart text-danger px-2 font-weight-bold"
																					title="Dépenses"
																				></i>
																				Achetés:{" "}
																				<NumberFormat
																					value={
																						acheter
																					}
																					displayType={
																						"text"
																					}
																					thousandSeparator={
																						true
																					}
																					decimalScale={
																						true
																					}
																					suffix={
																						" XAF"
																					}
																					className="text-danger"
																				/>
																			</div>
																			<div className="">
																				<i
																					class="tim-icons icon-refresh-02 text-success px-2 font-weight-bold"
																					title="Réutilisation"
																				></i>
																				Réutilisés:{" "}
																				<NumberFormat
																					value={
																						reutiliser
																					}
																					displayType={
																						"text"
																					}
																					thousandSeparator={
																						true
																					}
																					decimalScale={
																						true
																					}
																					suffix={
																						" XAF"
																					}
																					className="text-success"
																				/>
																			</div>
																		</div>
																	) : (
																		""
																	)}
																	<table className="table table-striped">
																		<tbody>
																			{alimentList.length ==
																			0 ? (
																				<tr className="text-center text-danger m-auto">
																					Vide
																				</tr>
																			) : (
																				""
																			)}

																			{alimentList.map(
																				(
																					aliment
																				) => (
																					<tr
																						key={
																							aliment._id
																						}
																					>
																						<td className="text-center">
																							{aliment.recyclage ==
																							"oui" ? (
																								<i
																									class="tim-icons icon-refresh-02 text-success px-2 font-weight-bold"
																									title="Cet aliment est une réutilisation"
																								></i>
																							) : (
																								""
																							)}
																							{
																								aliment.titre
																							}
																						</td>
																						<td className="text-center">
																							{" "}
																							<NumberFormat
																								value={
																									aliment.quantite *
																									aliment.poidsUnitaire
																								}
																								displayType={
																									"text"
																								}
																								thousandSeparator={
																									true
																								}
																								decimalScale={
																									true
																								}
																								suffix={
																									" Kg"
																								}
																							/>{" "}
																							X{" "}
																							<NumberFormat
																								value={Math.round(
																									aliment.prix /
																										(aliment.quantite *
																											aliment.poidsUnitaire)
																								)}
																								displayType={
																									"text"
																								}
																								thousandSeparator={
																									true
																								}
																								decimalScale={
																									true
																								}
																								suffix={
																									" XAF"
																								}
																							/>
																						</td>
																						<td className="text-center">
																							chez{" "}
																							{
																								aliment.fournisseur
																							}
																						</td>
																						<td className="text-center">
																							quantité
																							utilisée:{" "}
																							<strong>
																								{
																									aliment.qteUtilise
																								}{" "}
																								Sacs
																							</strong>
																						</td>
																					</tr>
																				)
																			)}
																		</tbody>
																	</table>
																</div>
															</div>
														</div>
														<div class="accordion-item">
															<h2
																class="accordion-header"
																id="headingThree"
															>
																<button
																	class="accordion-button collapsed"
																	type="button"
																	data-bs-toggle="collapse"
																	data-bs-target="#collapseThree"
																	aria-expanded="false"
																	aria-controls="collapseThree"
																>
																	Voir les
																	dépenses en
																	soins.
																</button>
															</h2>
															<div
																id="collapseThree"
																class="accordion-collapse collapse"
																aria-labelledby="headingThree"
																data-bs-parent="#accordionExample"
															>
																<div
																	class="accordion-body"
																	style={{
																		height: "200px",
																		overflow:
																			"auto",
																	}}
																>
																	<table className="table table-striped">
																		<tbody>
																			{soin_medicalList.length ==
																			0 ? (
																				<tr className="text-center text-danger m-auto">
																					Vide
																				</tr>
																			) : (
																				""
																			)}
																			{soin_medicalList.map(
																				(
																					soins
																				) => (
																					<tr
																						key={
																							soins._id
																						}
																					>
																						<td className="text-center">
																							{
																								soins.titre
																							}
																						</td>
																						<td className="text-center">
																							{" "}
																							<NumberFormat
																								value={
																									soins.quantite
																								}
																								displayType={
																									"text"
																								}
																								thousandSeparator={
																									true
																								}
																								decimalScale={
																									true
																								}
																								suffix={
																									" Kg"
																								}
																							/>{" "}
																							X{" "}
																							<NumberFormat
																								value={Math.round(
																									soins.prix /
																										soins.quantite
																								)}
																								displayType={
																									"text"
																								}
																								thousandSeparator={
																									true
																								}
																								decimalScale={
																									true
																								}
																								suffix={
																									" XAF"
																								}
																							/>
																						</td>
																						<td className="text-center">
																							chez{" "}
																							{
																								soins.fournisseur
																							}
																						</td>
																						<td className="text-center">
																							le:{" "}
																							<strong>
																								{moment(
																									new Date(
																										soins.created_at
																									)
																								).format(
																									"DD/MM/YYYY"
																								)}
																							</strong>
																						</td>
																					</tr>
																				)
																			)}
																		</tbody>
																	</table>
																</div>
															</div>
														</div>
														<div class="accordion-item">
															<h2
																class="accordion-header"
																id="heading4"
															>
																<button
																	class="accordion-button collapsed"
																	type="button"
																	data-bs-toggle="collapse"
																	data-bs-target="#collapse4"
																	aria-expanded="false"
																	aria-controls="collapse4"
																>
																	Voir les
																	paiements de
																	main
																	d'oeuvre.
																</button>
															</h2>
															<div
																id="collapse4"
																class="accordion-collapse collapse"
																aria-labelledby="heading4"
																data-bs-parent="#accordionExample"
															>
																<div
																	class="accordion-body"
																	style={{
																		height: "200px",
																		overflow:
																			"auto",
																	}}
																>
																	<table className="table table-striped">
																		<tbody>
																			{main_deouvreList.length ==
																			0 ? (
																				<tr className="text-center text-danger m-auto">
																					Vide
																				</tr>
																			) : (
																				""
																			)}
																			{main_deouvreList.map(
																				(
																					mainDoeuvre
																				) => (
																					<tr
																						key={
																							mainDoeuvre._id
																						}
																					>
																						<td className="text-center">
																							{
																								mainDoeuvre.titre
																							}
																						</td>
																						<td className="text-center">
																							{" "}
																							<NumberFormat
																								value={
																									mainDoeuvre.prix
																								}
																								displayType={
																									"text"
																								}
																								thousandSeparator={
																									true
																								}
																								decimalScale={
																									true
																								}
																								suffix={
																									" XAF"
																								}
																							/>
																						</td>
																						<td className="text-center">
																							le:{" "}
																							<strong>
																								{moment(
																									new Date(
																										mainDoeuvre.created_at
																									)
																								).format(
																									"DD/MM/YYYY"
																								)}
																							</strong>
																						</td>
																					</tr>
																				)
																			)}
																		</tbody>
																	</table>
																</div>
															</div>
														</div>
														<div class="accordion-item">
															<h2
																class="accordion-header"
																id="heading5"
															>
																<button
																	class="accordion-button collapsed"
																	type="button"
																	data-bs-toggle="collapse"
																	data-bs-target="#collapse5"
																	aria-expanded="false"
																	aria-controls="collapse5"
																>
																	Voir les
																	dépenses en
																	eau.
																</button>
															</h2>
															<div
																id="collapse5"
																class="accordion-collapse collapse"
																aria-labelledby="heading5"
																data-bs-parent="#accordionExample"
															>
																<div
																	class="accordion-body"
																	style={{
																		height: "200px",
																		overflow:
																			"auto",
																	}}
																>
																	<table className="table table-striped">
																		<tbody>
																			{eauList.length ==
																			0 ? (
																				<tr className="text-center text-danger m-auto">
																					Vide
																				</tr>
																			) : (
																				""
																			)}
																			{eauList.map(
																				(
																					eau
																				) => (
																					<tr
																						key={
																							eau._id
																						}
																					>
																						<td className="text-center">
																							{
																								eau.titre
																							}
																						</td>
																						<td className="text-center">
																							{" "}
																							<NumberFormat
																								value={
																									eau.prix
																								}
																								displayType={
																									"text"
																								}
																								thousandSeparator={
																									true
																								}
																								decimalScale={
																									true
																								}
																								suffix={
																									" XAF"
																								}
																							/>
																						</td>
																						<td className="text-center">
																							le:{" "}
																							<strong>
																								{moment(
																									new Date(
																										eau.created_at
																									)
																								).format(
																									"DD/MM/YYYY"
																								)}
																							</strong>
																						</td>
																					</tr>
																				)
																			)}
																		</tbody>
																	</table>
																</div>
															</div>
														</div>
														<div class="accordion-item">
															<h2
																class="accordion-header"
																id="heading6"
															>
																<button
																	class="accordion-button collapsed"
																	type="button"
																	data-bs-toggle="collapse"
																	data-bs-target="#collapse6"
																	aria-expanded="false"
																	aria-controls="collapse6"
																>
																	Voir les
																	dépenses en
																	électricité.
																</button>
															</h2>
															<div
																id="collapse6"
																class="accordion-collapse collapse"
																aria-labelledby="heading6"
																data-bs-parent="#accordionExample"
															>
																<div
																	class="accordion-body"
																	style={{
																		height: "200px",
																		overflow:
																			"auto",
																	}}
																>
																	<table className="table table-striped">
																		<tbody>
																			{electriciteList.length ==
																			0 ? (
																				<tr className="text-center text-danger m-auto">
																					Vide
																				</tr>
																			) : (
																				""
																			)}
																			{electriciteList.map(
																				(
																					electricite
																				) => (
																					<tr
																						key={
																							electricite._id
																						}
																					>
																						<td className="text-center">
																							{
																								electricite.titre
																							}
																						</td>
																						<td className="text-center">
																							{" "}
																							<NumberFormat
																								value={
																									electricite.prix
																								}
																								displayType={
																									"text"
																								}
																								thousandSeparator={
																									true
																								}
																								decimalScale={
																									true
																								}
																								suffix={
																									" XAF"
																								}
																							/>
																						</td>
																						<td className="text-center">
																							le:{" "}
																							<strong>
																								{moment(
																									new Date(
																										electricite.created_at
																									)
																								).format(
																									"DD/MM/YYYY"
																								)}
																							</strong>
																						</td>
																					</tr>
																				)
																			)}
																		</tbody>
																	</table>
																</div>
															</div>
														</div>
														<div class="accordion-item">
															<h2
																class="accordion-header"
																id="heading7"
															>
																<button
																	class="accordion-button collapsed"
																	type="button"
																	data-bs-toggle="collapse"
																	data-bs-target="#collapse7"
																	aria-expanded="false"
																	aria-controls="collapse7"
																>
																	Voir les
																	dépenses
																	d'aménagement.
																</button>
															</h2>
															<div
																id="collapse7"
																class="accordion-collapse collapse"
																aria-labelledby="heading7"
																data-bs-parent="#accordionExample"
															>
																<div
																	class="accordion-body"
																	style={{
																		height: "200px",
																		overflow:
																			"auto",
																	}}
																>
																	<table className="table table-striped">
																		<tbody>
																			{amenagementList.length ==
																			0 ? (
																				<tr className="text-center text-danger m-auto">
																					Vide
																				</tr>
																			) : (
																				""
																			)}
																			{amenagementList.map(
																				(
																					amenagement
																				) => (
																					<tr
																						key={
																							amenagement._id
																						}
																					>
																						<td className="text-center">
																							{
																								amenagement.titre
																							}
																						</td>
																						<td className="text-center">
																							{" "}
																							<NumberFormat
																								value={
																									amenagement.quantite
																								}
																								displayType={
																									"text"
																								}
																								thousandSeparator={
																									true
																								}
																								decimalScale={
																									true
																								}
																								suffix={
																									" Kg"
																								}
																							/>{" "}
																							X{" "}
																							<NumberFormat
																								value={Math.round(
																									amenagement.prix /
																										amenagement.quantite
																								)}
																								displayType={
																									"text"
																								}
																								thousandSeparator={
																									true
																								}
																								decimalScale={
																									true
																								}
																								suffix={
																									" XAF"
																								}
																							/>
																						</td>
																						<td className="text-center">
																							Par:{" "}
																							<strong>
																								{
																									amenagement.fournisseur
																								}
																							</strong>
																						</td>
																						<td className="text-center">
																							le:{" "}
																							<strong>
																								{moment(
																									new Date(
																										amenagement.created_at
																									)
																								).format(
																									"DD/MM/YYYY"
																								)}
																							</strong>
																						</td>
																					</tr>
																				)
																			)}
																		</tbody>
																	</table>
																</div>
															</div>
														</div>
														<div class="accordion-item">
															<h2
																class="accordion-header"
																id="heading8"
															>
																<button
																	class="accordion-button collapsed"
																	type="button"
																	data-bs-toggle="collapse"
																	data-bs-target="#collapse8"
																	aria-expanded="false"
																	aria-controls="collapse8"
																>
																	Voir les
																	dépenses du
																	local.
																</button>
															</h2>
															<div
																id="collapse8"
																class="accordion-collapse collapse"
																aria-labelledby="heading8"
																data-bs-parent="#accordionExample"
															>
																<div
																	class="accordion-body"
																	style={{
																		height: "200px",
																		overflow:
																			"auto",
																	}}
																>
																	<table className="table table-striped">
																		<tbody>
																			{location_localList.length ==
																			0 ? (
																				<tr className="text-center text-danger m-auto">
																					Vide
																				</tr>
																			) : (
																				""
																			)}
																			{location_localList.map(
																				(
																					location
																				) => (
																					<tr
																						key={
																							location._id
																						}
																					>
																						<td className="text-center">
																							{
																								location.titre
																							}
																						</td>
																						<td className="text-center">
																							{" "}
																							<NumberFormat
																								value={
																									location.prix
																								}
																								displayType={
																									"text"
																								}
																								thousandSeparator={
																									true
																								}
																								decimalScale={
																									true
																								}
																								suffix={
																									" XAF"
																								}
																							/>
																						</td>
																						<td className="text-center">
																							le:{" "}
																							<strong>
																								{moment(
																									new Date(
																										location.created_at
																									)
																								).format(
																									"DD/MM/YYYY"
																								)}
																							</strong>
																						</td>
																					</tr>
																				)
																			)}
																		</tbody>
																	</table>
																</div>
															</div>
														</div>
														<div class="accordion-item">
															<h2
																class="accordion-header"
																id="heading9"
															>
																<button
																	class="accordion-button collapsed"
																	type="button"
																	data-bs-toggle="collapse"
																	data-bs-target="#collapse9"
																	aria-expanded="false"
																	aria-controls="collapse9"
																>
																	Voir les
																	charges de
																	livraison.
																</button>
															</h2>
															<div
																id="collapse9"
																class="accordion-collapse collapse"
																aria-labelledby="heading9"
																data-bs-parent="#accordionExample"
															>
																<div
																	class="accordion-body"
																	style={{
																		height: "200px",
																		overflow:
																			"auto",
																	}}
																>
																	<table className="table table-striped">
																		<tbody>
																			{transport_venteList.length ==
																			0 ? (
																				<tr className="text-center text-danger m-auto">
																					Vide
																				</tr>
																			) : (
																				""
																			)}
																			{transport_venteList.map(
																				(
																					transportVente
																				) => (
																					<tr
																						key={
																							transportVente._id
																						}
																					>
																						<td className="text-center">
																							{
																								transportVente.destination
																							}
																						</td>
																						<td className="text-center">
																							{" "}
																							<NumberFormat
																								value={
																									transportVente.prix
																								}
																								displayType={
																									"text"
																								}
																								thousandSeparator={
																									true
																								}
																								decimalScale={
																									true
																								}
																								suffix={
																									" XAF"
																								}
																							/>
																						</td>
																						<td className="text-center">
																							Par:{" "}
																							{
																								transportVente.transporteur
																							}
																						</td>
																						<td className="text-center">
																							le:{" "}
																							<strong>
																								{moment(
																									new Date(
																										transportVente.created_at
																									)
																								).format(
																									"DD/MM/YYYY"
																								)}
																							</strong>
																						</td>
																					</tr>
																				)
																			)}
																		</tbody>
																	</table>
																</div>
															</div>
														</div>
														<div class="accordion-item">
															<h2
																class="accordion-header"
																id="heading10"
															>
																<button
																	class="accordion-button collapsed"
																	type="button"
																	data-bs-toggle="collapse"
																	data-bs-target="#collapse10"
																	aria-expanded="false"
																	aria-controls="collapse10"
																>
																	Voir les
																	autres
																	dépenses.
																</button>
															</h2>
															<div
																id="collapse10"
																class="accordion-collapse collapse"
																aria-labelledby="heading10"
																data-bs-parent="#accordionExample"
															>
																<div
																	class="accordion-body"
																	style={{
																		height: "200px",
																		overflow:
																			"auto",
																	}}
																>
																	<table className="table table-striped">
																		<tbody>
																			{autreDepenseList.length ==
																			0 ? (
																				<tr className="text-center text-danger m-auto">
																					Vide
																				</tr>
																			) : (
																				""
																			)}
																			{autreDepenseList.map(
																				(
																					autresDepenses
																				) => (
																					<tr
																						key={
																							autresDepenses._id
																						}
																					>
																						<td className="text-center">
																							{
																								autresDepenses.titre
																							}
																						</td>
																						<td className="text-center">
																							{" "}
																							<NumberFormat
																								value={
																									autresDepenses.prix
																								}
																								displayType={
																									"text"
																								}
																								thousandSeparator={
																									true
																								}
																								decimalScale={
																									true
																								}
																								suffix={
																									" XAF"
																								}
																							/>
																						</td>
																						<td className="text-center">
																							le:{" "}
																							<strong>
																								{moment(
																									new Date(
																										autresDepenses.created_at
																									)
																								).format(
																									"DD/MM/YYYY"
																								)}
																							</strong>
																						</td>
																					</tr>
																				)
																			)}
																		</tbody>
																	</table>
																</div>
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>

									<div
										class="alert alert-info text-center"
										role="alert"
									>
										<strong>
											<i class="tim-icons icon-double-right text-info"></i>
										</strong>
										Aliments consommés:{" "}
										<strong>
											<NumberFormat
												value={
													rapportVague.total_quantite_aliment_consommée
														? rapportVague.total_quantite_aliment_consommée
														: 0
												}
												displayType={"text"}
												thousandSeparator={true}
												decimalScale={true}
												suffix={" Sacs"}
											/>{" "}
											(
											<NumberFormat
												value={
													rapportVague.total_valeur_aliment_consommée
														? rapportVague.total_valeur_aliment_consommée
														: 0
												}
												displayType={"text"}
												thousandSeparator={true}
												decimalScale={true}
												suffix={" XAF"}
											/>
											)
										</strong>
									</div>
									<div
										class="alert alert-info text-center"
										role="alert"
									>
										<strong>
											<i class="tim-icons icon-double-right text-info"></i>
										</strong>
										Aliments restant:{" "}
										<strong>
											<NumberFormat
												value={
													rapportVague.total_quantite_aliment_restant
														? rapportVague.total_quantite_aliment_restant
														: 0
												}
												displayType={"text"}
												thousandSeparator={true}
												decimalScale={true}
												suffix={" Sacs"}
											/>{" "}
											(
											<NumberFormat
												value={
													rapportVague.total_valeur_aliment_restant
														? rapportVague.total_valeur_aliment_restant
														: 0
												}
												displayType={"text"}
												thousandSeparator={true}
												decimalScale={true}
												suffix={" XAF"}
											/>
											)
										</strong>
									</div>

									<div
										class="alert alert-info text-center"
										role="alert"
									>
										<strong>
											<i class="tim-icons icon-double-right text-info"></i>
										</strong>
										Reformés de la vague:{" "}
										<strong>
											<NumberFormat
												value={
													rapportVague.total_reformes
														? rapportVague.total_reformes
														: 0
												}
												displayType={"text"}
												thousandSeparator={true}
												decimalScale={true}
												suffix={" Sujets"}
											/>{" "}
										</strong>
									</div>

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
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default PageRapportVague;

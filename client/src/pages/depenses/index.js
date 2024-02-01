import React, { useState, useEffect } from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Link,
	Navigate,
} from "react-router-dom";
import NavBar from "../../components/utils/navBar";
import AlimentsCout from "../../components/couts/aliment_cout";
import VagueCout from "../../components/couts/vague_cout";
import AmenagementCout from "../../components/couts/amenagement_cout";
import LocationLocalCout from "../../components/couts/locationLocal_cout";
import MainDoeuvreCout from "../../components/couts/mainDoeuvre_cout";
import ElectriciteCout from "../../components/couts/electricite_cout";
import SoinMedicalCout from "../../components/couts/soinMedical_cout";
import EauCout from "../../components/couts/eau_cout";
import TransportVenteCout from "../../components/couts/transportVente_cout";
import AutreDepenseCout from "../../components/couts/autreDepense_cout";
import { Empty } from "../../components/couts/empty";

import LocalStorage from "localStorage";
import Popup from "reactjs-popup";
import moment from "moment";
import { useParams } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";
import NumberFormat from "react-number-format";
import Axios from "axios";
import { Line } from "react-chartjs-2";
import {
	Provider as AlertProvider,
	useAlert,
	positions,
	types,
	transitions,
} from "react-alert";

function PageDepenses() {
	const { vagueId } = useParams();
	const [loading, setLoading] = useState(false);
	const [vagueList, setVagueList] = useState(
		JSON.parse(LocalStorage.getItem("vagueList"))
			? JSON.parse(LocalStorage.getItem("vagueList"))
			: []
	);
	const [vague, setVague] = useState({});
	const [resteActu, setResteActu] = useState(0);
	const [budget, setBudget] = useState(0);
	const [depenseActu, setDepenseActu] = useState(0);

	const [budget_animaux, setBudget_animaux] = useState(0);
	const [budget_aliments, setBudget_aliments] = useState(0);
	const [budget_soins_medicaux, setBudget_soins_medicaux] = useState(0);
	const [budget_amenagements, setBudget_amenagements] = useState(0);
	const [budget_location_local, setBudget_location_local] = useState(0);
	const [budget_main_doeuvre, setBudget_main_doeuvre] = useState(0);
	const [budget_electricite, setBudget_electricite] = useState(0);
	const [budget_eau, setBudget_eau] = useState(0);
	const [budget_transport_vente, setBudget_transport_vente] = useState(0);
	const [budget_autres_depenses, setBudget_autres_depenses] = useState(0);

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

	const getVagues = () => {
		Axios.get(`/api/customers/vague`)
			.then((res) => {
				LocalStorage.setItem("vagueList", JSON.stringify(res.data));
				setVagueList(res.data);
				getVague(res.data);
			})
			.catch(() => {
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

	useEffect(() => {
		getVagues();
		getVague(vagueList);
		getDepensesActu();
	}, []);

	useEffect(() => {
		getReste(vagueId);
		getBudget(vague);
		getDepensesActu();
	}, [vague, vagueList]);

	const [show1, setShow1] = useState(false);
	const [show2, setShow2] = useState(false);
	const [show3, setShow3] = useState(false);
	const [show4, setShow4] = useState(false);
	const [show5, setShow5] = useState(false);
	const [show6, setShow6] = useState(false);
	const [show7, setShow7] = useState(false);
	const [show8, setShow8] = useState(false);
	const [show9, setShow9] = useState(false);
	const [show10, setShow10] = useState(false);
	const setShowUpdateForm = (number) => {
		setShow1(false);
		setShow2(false);
		setShow3(false);
		setShow4(false);
		setShow5(false);
		setShow6(false);
		setShow7(false);
		setShow8(false);
		setShow9(false);
		setShow10(false);
		if (number === 1) setShow1(!show1);
		if (number === 2) setShow2(!show2);
		if (number === 3) setShow3(!show3);
		if (number === 4) setShow4(!show4);
		if (number === 5) setShow5(!show5);
		if (number === 6) setShow6(!show6);
		if (number === 7) setShow7(!show7);
		if (number === 8) setShow8(!show8);
		if (number === 9) setShow9(!show9);
		if (number === 10) setShow10(!show10);
	};

	const getReste = (vagueId) => {
		setLoading(true);
		Axios.get(`api/results/reste/${vagueId}`)
			.then((res) => {
				setLoading(false);
				if (res.status === 200) {
					setResteActu(res.data.reste);
				}
			})
			.catch((error) => {
				showAlertError(error.response.data.message);
				setLoading(false);
			});
	};

	const getBudget = (vague) => {
		setBudget(vague.budget_prevu);
		setBudget_animaux(vague.budget_animaux);
		setBudget_aliments(vague.budget_aliments);
		setBudget_soins_medicaux(vague.budget_soins_medicaux);
		setBudget_amenagements(vague.budget_amenagements);
		setBudget_location_local(vague.budget_location_local);
		setBudget_main_doeuvre(vague.budget_main_doeuvre);
		setBudget_electricite(vague.budget_electricite);
		setBudget_eau(vague.budget_eau);
		setBudget_transport_vente(vague.budget_transport_vente);
		setBudget_autres_depenses(vague.budget_autres_depenses);
	};

	const getDepensesActu = () => {
		Axios.get(`api/results/depenses_actu/${vagueId}`).then((res) => {
			if (res.status === 200) {
				setDepenseActu(res.data.depenseActuelle);
			}
		});
	};

	const updateVagueBudgetAnimaux = (vagueId) => {
		setLoading(true);
		if (budget_animaux < 0) {
			setLoading(false);
			return showAlertError("Entrez les bonnes données !");
		}
		Axios.put(`/api/customers/vague/${vagueId}`, {
			budget_animaux: budget_animaux,
			_id: vagueId,
		})
			.then((response) => {
				getReste(vagueId);
				getBudget(vagueId);
				getVague();
				if (response.status === 201) {
					showAlertSuccess(response.data.message);
				} else {
					showAlertError("Verifiez vos champs et recommencez");
				}
				setLoading(false);
			})
			.catch((error) => {
				showAlertError(error.response.data.message);
				setLoading(false);
			});
	};
	const updateVagueBudgetAliment = (vagueId) => {
		setLoading(true);
		if (budget_aliments < 0) {
			setLoading(false);
			return showAlertError("Entrez les bonnes données !");
		}
		Axios.put(`/api/customers/vague/${vagueId}`, {
			budget_aliments: budget_aliments,
			_id: vagueId,
		})
			.then((response) => {
				getReste(vagueId);
				getBudget(vagueId);
				getVague();
				if (response.status === 201) {
					showAlertSuccess(response.data.message);
				} else {
					showAlertError("Verifiez vos champs et recommencez");
				}
				setLoading(false);
			})
			.catch((error) => {
				showAlertError(error.response.data.message);
				setLoading(false);
			});
	};
	const updateVagueBudgetAmenagement = (vagueId) => {
		setLoading(true);
		if (budget_amenagements < 0) {
			setLoading(false);
			return showAlertError("Entrez les bonnes données !");
		}
		Axios.put(`/api/customers/vague/${vagueId}`, {
			budget_amenagements: budget_amenagements,
			_id: vagueId,
		})
			.then((response) => {
				getReste(vagueId);
				getBudget(vagueId);
				getVague();
				if (response.status === 201) {
					showAlertSuccess(response.data.message);
				} else {
					showAlertError("Verifiez vos champs et recommencez");
				}
				setLoading(false);
			})
			.catch((error) => {
				showAlertError(error.response.data.message);
				setLoading(false);
			});
	};
	const updateVagueBudgetAutreDepenses = (vagueId) => {
		setLoading(true);
		if (budget_autres_depenses < 0) {
			setLoading(false);
			return showAlertError("Entrez les bonnes données !");
		}
		Axios.put(`/api/customers/vague/${vagueId}`, {
			budget_autres_depenses: budget_autres_depenses,
			_id: vagueId,
		})
			.then((response) => {
				getReste(vagueId);
				getBudget(vagueId);
				getVague();
				if (response.status === 201) {
					showAlertSuccess(response.data.message);
				} else {
					showAlertError("Verifiez vos champs et recommencez");
				}
				setLoading(false);
			})
			.catch((error) => {
				showAlertError(error.response.data.message);
				setLoading(false);
			});
	};
	const updateVagueBudgetEau = (vagueId) => {
		setLoading(true);
		if (budget_eau < 0) {
			setLoading(false);
			return showAlertError("Entrez les bonnes données !");
		}
		Axios.put(`/api/customers/vague/${vagueId}`, {
			budget_eau: budget_eau,
			_id: vagueId,
		})
			.then((response) => {
				getReste(vagueId);
				getBudget(vagueId);
				getVague();
				if (response.status === 201) {
					showAlertSuccess(response.data.message);
				} else {
					showAlertError("Verifiez vos champs et recommencez");
				}
				setLoading(false);
			})
			.catch((error) => {
				showAlertError(error.response.data.message);
				setLoading(false);
			});
	};
	const updateVagueBudgetElectricite = (vagueId) => {
		setLoading(true);
		if (budget_electricite < 0) {
			setLoading(false);
			return showAlertError("Entrez les bonnes données !");
		}
		Axios.put(`/api/customers/vague/${vagueId}`, {
			budget_electricite: budget_electricite,
			_id: vagueId,
		})
			.then((response) => {
				getReste(vagueId);
				getBudget(vagueId);
				getVague();
				if (response.status === 201) {
					showAlertSuccess(response.data.message);
				} else {
					showAlertError("Verifiez vos champs et recommencez");
				}
				setLoading(false);
			})
			.catch((error) => {
				showAlertError(error.response.data.message);
				setLoading(false);
			});
	};
	const updateVagueBudgetLocationLocal = (vagueId) => {
		setLoading(true);
		if (budget_location_local < 0) {
			setLoading(false);
			return showAlertError("Entrez les bonnes données !");
		}
		Axios.put(`/api/customers/vague/${vagueId}`, {
			budget_location_local: budget_location_local,
			_id: vagueId,
		})
			.then((response) => {
				getReste(vagueId);
				getBudget(vagueId);
				getVague();
				if (response.status === 201) {
					showAlertSuccess(response.data.message);
				} else {
					showAlertError("Verifiez vos champs et recommencez");
				}
				setLoading(false);
			})
			.catch((error) => {
				showAlertError(error.response.data.message);
				setLoading(false);
			});
	};
	const updateVagueBudgetMainDoeuvre = (vagueId) => {
		setLoading(true);
		if (budget_main_doeuvre < 0) {
			setLoading(false);
			return showAlertError("Entrez les bonnes données !");
		}
		Axios.put(`/api/customers/vague/${vagueId}`, {
			budget_main_doeuvre: budget_main_doeuvre,
			_id: vagueId,
		})
			.then((response) => {
				getReste(vagueId);
				getBudget(vagueId);
				getVague();
				if (response.status === 201) {
					showAlertSuccess(response.data.message);
				} else {
					showAlertError("Verifiez vos champs et recommencez");
				}
				setLoading(false);
			})
			.catch((error) => {
				showAlertError(error.response.data.message);
				setLoading(false);
			});
	};
	const updateVagueBudgetSoinsMedicaux = (vagueId) => {
		setLoading(true);
		if (budget_soins_medicaux < 0) {
			setLoading(false);
			return showAlertError("Entrez les bonnes données !");
		}
		Axios.put(`/api/customers/vague/${vagueId}`, {
			budget_soins_medicaux: budget_soins_medicaux,
			_id: vagueId,
		})
			.then((response) => {
				getReste(vagueId);
				getBudget(vagueId);
				getVague();
				if (response.status === 201) {
					showAlertSuccess(response.data.message);
				} else {
					showAlertError("Verifiez vos champs et recommencez");
				}
				setLoading(false);
			})
			.catch((error) => {
				showAlertError(error.response.data.message);
				setLoading(false);
			});
	};
	const updateVagueBudgetTransportVente = (vagueId) => {
		setLoading(true);
		if (budget_transport_vente < 0) {
			setLoading(false);
			return showAlertError("Entrez les bonnes données !");
		}
		Axios.put(`/api/customers/vague/${vagueId}`, {
			budget_transport_vente: budget_transport_vente,
			_id: vagueId,
		})
			.then((response) => {
				getReste(vagueId);
				getBudget(vagueId);
				getVague();
				if (response.status === 201) {
					showAlertSuccess(response.data.message);
				} else {
					showAlertError("Verifiez vos champs et recommencez");
				}
				setLoading(false);
			})
			.catch((error) => {
				showAlertError(error.response.data.message);
				setLoading(false);
			});
	};

	return (
		<div>
			<NavBar
				VAGUEID={vagueId}
				vagueList={vagueList}
				funtionToUpdate={getDepensesActu}
			/>
			<div className="p-0 col-lg-10" style={{ float: "right" }}>
				<div className="container-fluid page-body-wrapper">
					<div className="main-panel" style={{ width: "100%" }}>
						<div
							style={{
								padding: "30px",
								backgroundColor: "#f5f7ff",
								height: "100%",
							}}
						>
							<Link
								to={`/pages/vagues/${vagueId}`}
								class="p-2 float-lg-left mt-3 mb-5"
							>
								<i
									class="tim-icons icon-double-left"
									style={{
										color: "rgba(76, 16, 255, 0.777)",
										fontWeight: "bold",
									}}
								></i>
							</Link>
							<h2 className="text-center bg-gradient-warning rounded text-white p-2 col-lg-7 mt-2 mx-auto">
								Dépenses
							</h2>
							<div
								style={{
									marginTop: "40px",
									marginBottom: "45px",
								}}
							>
								<div class="card card-chart my-3">
									<div class="card-header">
										<div className="row">
											<div className="col-lg-4">
												<h5 class="card-category">
													Total dépenses
												</h5>
												<h3 class="card-title">
													<i class="tim-icons icon-chart-pie-36 text-warning"></i>{" "}
													<NumberFormat
														value={depenseActu}
														displayType={"text"}
														thousandSeparator={true}
														decimalScale={true}
														suffix={" XAF"}
													/>
												</h3>
											</div>
											<div className="col-lg-4">
												<h5 class="card-category">
													Budget prévu
												</h5>
												<h3 class="card-title">
													<i class="tim-icons icon-wallet-43 text-warning"></i>{" "}
													<NumberFormat
														value={budget}
														displayType={"text"}
														thousandSeparator={true}
														decimalScale={true}
														suffix={" XAF"}
													/>
													<div className="mt-2">
														<a
															className="text-primary fs-6"
															data-bs-target="#detailBudget"
															data-bs-toggle="modal"
															data-bs-dismiss="modal"
														>
															Détails du budget
														</a>
														<div
															id="detailBudget"
															class="modal fade text-dark"
															aria-hidden="true"
															aria-labelledby="detailBudgetLabel"
															tabindex="-1"
															data-bs-backdrop="static"
															data-bs-keyboard="false"
														>
															<div
																class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable"
																style={{
																	margin: "auto",
																	marginTop:
																		"30px",
																}}
															>
																<div class="modal-content">
																	<div class="modal-header">
																		<h5
																			class="modal-title"
																			id="detailBudgetLabel"
																		>
																			Détails
																			des
																			budgets
																			prévus
																			par
																			catégorie.
																		</h5>
																		<button
																			class="btn-close"
																			type="button"
																			data-bs-dismiss="modal"
																			aria-label="Close"
																		></button>
																	</div>
																	<div class="modal-body py-2 px-3">
																		<table className="table table-striped">
																			<thead>
																				<tr>
																					<th className="text-center">
																						{" "}
																						Catégorie{" "}
																					</th>
																					<th className="text-center">
																						{" "}
																						Montant
																						(CFA){" "}
																					</th>
																				</tr>
																			</thead>
																			<tbody>
																				<tr>
																					<td className="text-center">
																						{" "}
																						Sujets{" "}
																					</td>
																					<td className="text-center">
																						<NumberFormat
																							value={
																								budget_animaux
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
																						<a
																							className={`fs-6 p-2 ${
																								vague.etat ==
																								2
																									? "d-none"
																									: ""
																							}`}
																							onClick={() => {
																								setShowUpdateForm(
																									1
																								);
																							}}
																						>
																							<i class="tim-icons icon-pencil text-success mx-2"></i>
																						</a>
																						<div
																							className={`text-center position-absolute bg-light p-2 ${
																								show1
																									? ""
																									: "d-none"
																							}`}
																							style={{
																								right: "22%",
																							}}
																						>
																							<input
																								type="number"
																								min={
																									0
																								}
																								placeholder={
																									budget_animaux
																								}
																								onChange={(
																									event
																								) => {
																									setBudget_animaux(
																										event
																											.target
																											.value
																									);
																								}}
																								className="form-control"
																							/>
																							<button
																								className="btn btn-outline-success mt-2 btn-fw"
																								onClick={() => {
																									updateVagueBudgetAnimaux(
																										vagueId
																									);
																								}}
																							>
																								{" "}
																								Mettre
																								à
																								jour
																							</button>
																						</div>
																					</td>
																				</tr>
																				<tr>
																					<td className="text-center">
																						{" "}
																						Aliments{" "}
																					</td>
																					<td className="text-center">
																						<NumberFormat
																							value={
																								budget_aliments
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
																						<a
																							className={`fs-6 p-2 ${
																								vague.etat ==
																								2
																									? "d-none"
																									: ""
																							}`}
																							onClick={() => {
																								setShowUpdateForm(
																									2
																								);
																							}}
																						>
																							<i class="tim-icons icon-pencil text-success mx-2"></i>
																						</a>
																						<div
																							className={`text-center position-absolute bg-light p-2 ${
																								show2
																									? ""
																									: "d-none"
																							}`}
																							style={{
																								right: "22%",
																							}}
																						>
																							<input
																								type="number"
																								min={
																									0
																								}
																								placeholder={
																									budget_aliments
																								}
																								onChange={(
																									event
																								) => {
																									setBudget_aliments(
																										event
																											.target
																											.value
																									);
																								}}
																								className="form-control"
																							/>
																							<button
																								className="btn btn-outline-success mt-2 btn-fw"
																								onClick={() => {
																									updateVagueBudgetAliment(
																										vagueId
																									);
																								}}
																							>
																								{" "}
																								Mettre
																								à
																								jour
																							</button>
																						</div>
																					</td>
																				</tr>
																				<tr>
																					<td className="text-center">
																						{" "}
																						Aménagement{" "}
																					</td>
																					<td className="text-center">
																						<NumberFormat
																							value={
																								budget_amenagements
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
																						<a
																							className={`fs-6 p-2 ${
																								vague.etat ==
																								2
																									? "d-none"
																									: ""
																							}`}
																							onClick={() => {
																								setShowUpdateForm(
																									3
																								);
																							}}
																						>
																							<i class="tim-icons icon-pencil text-success mx-2"></i>
																						</a>
																						<div
																							className={`text-center position-absolute bg-light p-2 ${
																								show3
																									? ""
																									: "d-none"
																							}`}
																							style={{
																								right: "22%",
																							}}
																						>
																							<input
																								type="number"
																								min={
																									0
																								}
																								placeholder={
																									budget_amenagements
																								}
																								onChange={(
																									event
																								) => {
																									setBudget_amenagements(
																										event
																											.target
																											.value
																									);
																								}}
																								className="form-control"
																							/>
																							<button
																								className="btn btn-outline-success mt-2 btn-fw"
																								onClick={() => {
																									updateVagueBudgetAmenagement(
																										vagueId
																									);
																								}}
																							>
																								{" "}
																								Mettre
																								à
																								jour
																							</button>
																						</div>
																					</td>
																				</tr>
																				<tr>
																					<td className="text-center">
																						{" "}
																						Eau{" "}
																					</td>
																					<td className="text-center">
																						<NumberFormat
																							value={
																								budget_eau
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
																						<a
																							className={`fs-6 p-2 ${
																								vague.etat ==
																								2
																									? "d-none"
																									: ""
																							}`}
																							onClick={() => {
																								setShowUpdateForm(
																									4
																								);
																							}}
																						>
																							<i class="tim-icons icon-pencil text-success mx-2"></i>
																						</a>
																						<div
																							className={`text-center position-absolute bg-light p-2 ${
																								show4
																									? ""
																									: "d-none"
																							}`}
																							style={{
																								right: "22%",
																							}}
																						>
																							<input
																								type="number"
																								min={
																									0
																								}
																								placeholder={
																									budget_eau
																								}
																								onChange={(
																									event
																								) => {
																									setBudget_eau(
																										event
																											.target
																											.value
																									);
																								}}
																								className="form-control"
																							/>
																							<button
																								className="btn btn-outline-success mt-2 btn-fw"
																								onClick={() => {
																									updateVagueBudgetEau(
																										vagueId
																									);
																								}}
																							>
																								{" "}
																								Mettre
																								à
																								jour
																							</button>
																						</div>
																					</td>
																				</tr>
																				<tr>
																					<td className="text-center">
																						{" "}
																						Electricité{" "}
																					</td>
																					<td className="text-center">
																						<NumberFormat
																							value={
																								budget_electricite
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
																						<a
																							className={`fs-6 p-2 ${
																								vague.etat ==
																								2
																									? "d-none"
																									: ""
																							}`}
																							onClick={() => {
																								setShowUpdateForm(
																									5
																								);
																							}}
																						>
																							<i class="tim-icons icon-pencil text-success mx-2"></i>
																						</a>
																						<div
																							className={`text-center position-absolute bg-light p-2 ${
																								show5
																									? ""
																									: "d-none"
																							}`}
																							style={{
																								right: "22%",
																							}}
																						>
																							<input
																								type="number"
																								min={
																									0
																								}
																								placeholder={
																									budget_electricite
																								}
																								onChange={(
																									event
																								) => {
																									setBudget_electricite(
																										event
																											.target
																											.value
																									);
																								}}
																								className="form-control"
																							/>
																							<button
																								className="btn btn-outline-success mt-2 btn-fw"
																								onClick={() => {
																									updateVagueBudgetElectricite(
																										vagueId
																									);
																								}}
																							>
																								{" "}
																								Mettre
																								à
																								jour
																							</button>
																						</div>
																					</td>
																				</tr>
																				<tr>
																					<td className="text-center">
																						{" "}
																						Location
																						du
																						local{" "}
																					</td>
																					<td className="text-center">
																						<NumberFormat
																							value={
																								budget_location_local
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
																						<a
																							className={`fs-6 p-2 ${
																								vague.etat ==
																								2
																									? "d-none"
																									: ""
																							}`}
																							onClick={() => {
																								setShowUpdateForm(
																									6
																								);
																							}}
																						>
																							<i class="tim-icons icon-pencil text-success mx-2"></i>
																						</a>
																						<div
																							className={`text-center position-absolute bg-light p-2 ${
																								show6
																									? ""
																									: "d-none"
																							}`}
																							style={{
																								right: "22%",
																							}}
																						>
																							<input
																								type="number"
																								min={
																									0
																								}
																								placeholder={
																									budget_location_local
																								}
																								onChange={(
																									event
																								) => {
																									setBudget_location_local(
																										event
																											.target
																											.value
																									);
																								}}
																								className="form-control"
																							/>
																							<button
																								className="btn btn-outline-success mt-2 btn-fw"
																								onClick={() => {
																									updateVagueBudgetLocationLocal(
																										vagueId
																									);
																								}}
																							>
																								{" "}
																								Mettre
																								à
																								jour
																							</button>
																						</div>
																					</td>
																				</tr>
																				<tr>
																					<td className="text-center">
																						{" "}
																						Resource
																						humaine{" "}
																					</td>
																					<td className="text-center">
																						<NumberFormat
																							value={
																								budget_main_doeuvre
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
																						<a
																							className={`fs-6 p-2 ${
																								vague.etat ==
																								2
																									? "d-none"
																									: ""
																							}`}
																							onClick={() => {
																								setShowUpdateForm(
																									7
																								);
																							}}
																						>
																							<i class="tim-icons icon-pencil text-success mx-2"></i>
																						</a>
																						<div
																							className={`text-center position-absolute bg-light p-2 ${
																								show7
																									? ""
																									: "d-none"
																							}`}
																							style={{
																								right: "22%",
																							}}
																						>
																							<input
																								type="number"
																								min={
																									0
																								}
																								placeholder={
																									budget_main_doeuvre
																								}
																								onChange={(
																									event
																								) => {
																									setBudget_main_doeuvre(
																										event
																											.target
																											.value
																									);
																								}}
																								className="form-control"
																							/>
																							<button
																								className="btn btn-outline-success mt-2 btn-fw"
																								onClick={() => {
																									updateVagueBudgetMainDoeuvre(
																										vagueId
																									);
																								}}
																							>
																								{" "}
																								Mettre
																								à
																								jour
																							</button>
																						</div>
																					</td>
																				</tr>
																				<tr>
																					<td className="text-center">
																						{" "}
																						Soins
																						médicaux{" "}
																					</td>
																					<td className="text-center">
																						<NumberFormat
																							value={
																								budget_soins_medicaux
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
																						<a
																							className={`fs-6 p-2 ${
																								vague.etat ==
																								2
																									? "d-none"
																									: ""
																							}`}
																							onClick={() => {
																								setShowUpdateForm(
																									8
																								);
																							}}
																						>
																							<i class="tim-icons icon-pencil text-success mx-2"></i>
																						</a>
																						<div
																							className={`text-center position-absolute bg-light p-2 ${
																								show8
																									? ""
																									: "d-none"
																							}`}
																							style={{
																								right: "22%",
																							}}
																						>
																							<input
																								type="number"
																								min={
																									0
																								}
																								placeholder={
																									budget_soins_medicaux
																								}
																								onChange={(
																									event
																								) => {
																									setBudget_soins_medicaux(
																										event
																											.target
																											.value
																									);
																								}}
																								className="form-control"
																							/>
																							<button
																								className="btn btn-outline-success mt-2 btn-fw"
																								onClick={() => {
																									updateVagueBudgetSoinsMedicaux(
																										vagueId
																									);
																								}}
																							>
																								{" "}
																								Mettre
																								à
																								jour
																							</button>
																						</div>
																					</td>
																				</tr>
																				<tr>
																					<td className="text-center">
																						{" "}
																						Charges
																						de
																						livraison{" "}
																					</td>
																					<td className="text-center">
																						<NumberFormat
																							value={
																								budget_transport_vente
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
																						<a
																							className={`fs-6 p-2 ${
																								vague.etat ==
																								2
																									? "d-none"
																									: ""
																							}`}
																							onClick={() => {
																								setShowUpdateForm(
																									9
																								);
																							}}
																						>
																							<i class="tim-icons icon-pencil text-success mx-2"></i>
																						</a>
																						<div
																							className={`text-center position-absolute bg-light p-2 ${
																								show9
																									? ""
																									: "d-none"
																							}`}
																							style={{
																								right: "22%",
																							}}
																						>
																							<input
																								type="number"
																								min={
																									0
																								}
																								placeholder={
																									budget_transport_vente
																								}
																								onChange={(
																									event
																								) => {
																									setBudget_transport_vente(
																										event
																											.target
																											.value
																									);
																								}}
																								className="form-control"
																							/>
																							<button
																								className="btn btn-outline-success mt-2 btn-fw"
																								onClick={() => {
																									updateVagueBudgetTransportVente(
																										vagueId
																									);
																								}}
																							>
																								{" "}
																								Mettre
																								à
																								jour
																							</button>
																						</div>
																					</td>
																				</tr>
																				<tr>
																					<td className="text-center">
																						{" "}
																						Autres
																						dépenses{" "}
																					</td>
																					<td className="text-center">
																						<NumberFormat
																							value={
																								budget_autres_depenses
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
																						<a
																							className={`fs-6 p-2 ${
																								vague.etat ==
																								2
																									? "d-none"
																									: ""
																							}`}
																							onClick={() => {
																								setShowUpdateForm(
																									10
																								);
																							}}
																						>
																							<i class="tim-icons icon-pencil text-success mx-2"></i>
																						</a>
																						<div
																							className={`text-center position-absolute bg-light p-2 ${
																								show10
																									? ""
																									: "d-none"
																							}`}
																							style={{
																								right: "22%",
																							}}
																						>
																							<input
																								type="number"
																								min={
																									0
																								}
																								placeholder={
																									budget_autres_depenses
																								}
																								onChange={(
																									event
																								) => {
																									setBudget_autres_depenses(
																										event
																											.target
																											.value
																									);
																								}}
																								className="form-control"
																							/>
																							<button
																								className="btn btn-outline-success mt-2 btn-fw"
																								onClick={() => {
																									updateVagueBudgetAutreDepenses(
																										vagueId
																									);
																								}}
																							>
																								{" "}
																								Mettre
																								à
																								jour
																							</button>
																						</div>
																					</td>

																					{/* <td className="text-center">
														{sourceBudget_autres_depenses ==
														"Budget propre"
															? "Budget propre"
															: vagueList.map(
																	(vague) => {
																		if (
																			vague._id ==
																			sourceBudget_autres_depenses
																		) {
																			return vague.titre;
																		}
																	}
															  )}
													</td> */}
																				</tr>
																			</tbody>
																		</table>
																	</div>
																</div>
															</div>
														</div>
													</div>
												</h3>
											</div>
											<div className="col-lg-4">
												<h5 class="card-category">
													{resteActu < 0
														? "Excès au budget"
														: "Reste à dépenser"}
												</h5>
												<h3 class="card-title">
													<i
														class={`tim-icons icon-sound-wave ${
															resteActu < 0
																? "text-danger"
																: "text-warning"
														}`}
													></i>{" "}
													<span
														className={
															resteActu < 0
																? "text-danger"
																: ""
														}
													>
														<NumberFormat
															value={resteActu}
															displayType={"text"}
															thousandSeparator={
																true
															}
															decimalScale={true}
															suffix={" XAF"}
														/>
													</span>
												</h3>
											</div>
										</div>
										<button
											className={`btn bg-gradient-warning mx-2 ${
												vague.etat == 2 ? "d-none" : ""
											}`}
											data-bs-target="#ajoutDepense"
											data-bs-toggle="modal"
											data-bs-dismiss="modal"
											title="Ajouter un nouvel achat ou une dépenses"
										>
											<i class="tim-icons icon-chart-pie-36 text-white font-weight-bold"></i>
										</button>
									</div>

									<div className="col-md-12">
										<div className="table-responsive mb-md-0 mt-3">
											<table className="table table-borderless report-table">
												<tbody>
													<VagueCout
														vagueId={vagueId}
														depenseActu={
															depenseActu
														}
													/>
													<AlimentsCout
														vagueId={vagueId}
														depenseActu={
															depenseActu
														}
													/>
													<LocationLocalCout
														vagueId={vagueId}
														depenseActu={
															depenseActu
														}
													/>
													<AmenagementCout
														vagueId={vagueId}
														depenseActu={
															depenseActu
														}
													/>
													<MainDoeuvreCout
														vagueId={vagueId}
														depenseActu={
															depenseActu
														}
													/>
													<ElectriciteCout
														vagueId={vagueId}
														depenseActu={
															depenseActu
														}
													/>
													<SoinMedicalCout
														vagueId={vagueId}
														depenseActu={
															depenseActu
														}
													/>
													<EauCout
														vagueId={vagueId}
														depenseActu={
															depenseActu
														}
													/>
													<TransportVenteCout
														vagueId={vagueId}
														depenseActu={
															depenseActu
														}
													/>
													<AutreDepenseCout
														vagueId={vagueId}
														depenseActu={
															depenseActu
														}
													/>
													<Empty />
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
	);
}

export default PageDepenses;

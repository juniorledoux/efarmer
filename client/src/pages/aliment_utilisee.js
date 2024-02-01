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
import "reactjs-popup/dist/index.css";
import Axios from "axios";
import moment from "moment";
import Popup from "reactjs-popup";
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
import { useParams } from "react-router-dom";

function PageAlimentUtilisee() {
	const { vagueId, alimentId } = useParams();
	const [alimentUtiliseeList, setAlimentUtiliseeList] = useState(
		JSON.parse(LocalStorage.getItem("alimentUtiliseeList")) &&
			JSON.parse(LocalStorage.getItem("alimentUtiliseeList")).length !=
				0 &&
			JSON.parse(LocalStorage.getItem("alimentUtiliseeList"))[0]
				.alimentId == alimentId
			? JSON.parse(LocalStorage.getItem("alimentUtiliseeList"))
			: []
	);
	const [alimentList, setAlimentList] = useState(
		JSON.parse(LocalStorage.getItem("alimentList")) &&
			JSON.parse(LocalStorage.getItem("alimentList")).length != 0 &&
			JSON.parse(LocalStorage.getItem("alimentList"))[0].vagueId ==
				vagueId
			? JSON.parse(LocalStorage.getItem("alimentList"))
			: []
	);
	const [aliment, setAliment] = useState({});
	const [newQteUtilise, setNewQteUtilise] = useState();
	const [newDate_debut, setNewDateDebut] = useState("");
	const [newDate_fin, setNewDateFin] = useState("");
	const [vague, setVague] = useState({});
	const [vagueList, setVagueList] = useState(
		JSON.parse(LocalStorage.getItem("vagueList"))
			? JSON.parse(LocalStorage.getItem("vagueList"))
			: []
	);
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

	useEffect(() => {
		getAlimentUtilisees();
	}, []);
	useEffect(() => {
		getAliment(alimentList);
		getVague(vagueList);
	}, [alimentUtiliseeList]);

	const getAlimentUtilisees = () => {
		if (!alimentUtiliseeList || alimentUtiliseeList.length == 0)
			setLoading(true);
		Axios.get(`/api/alimentutilise/all/${alimentId}`)
			.then((response) => {
				setAlimentUtiliseeList(response.data.alimentsUtilisees);
				LocalStorage.setItem(
					"alimentUtiliseeList",
					JSON.stringify(response.data.alimentsUtilisees)
				);
				getAliment(alimentList);
				setLoading(false);
			})
			.catch(() => {
				showAlertError(error.response.data.message);
				setLoading(false);
			});
	};

	const getAliment = (alimentList) => {
		let a = {};
		alimentList.forEach((aliment) => {
			if (aliment._id == alimentId) {
				a = aliment;
			}
		});
		setAliment(a);
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

	const updateQteUtilise = (id) => {
		setLoading(true);
		if (newQteUtilise == "") {
			showAlertError("Le champs ne doit pas être vide");
			setLoading(false);
		} else {
			Axios.put(`/api/alimentutilise/${id}`, {
				qteUtilise: newQteUtilise,
				alimentId: alimentId,
			})
				.then((response) => {
					getAlimentUtilisees();
					if (response.status === 201)
						showAlertSuccess(response.data.message);
					else showAlertError("Verifiez vos champs et recommencez");
					setLoading(false);
				})
				.catch((error) => {
					showAlertError(error.response.data.message);
					setLoading(false);
				});
		}
	};

	const updateDateDebut = (id) => {
		setLoading(true);
		if (newDate_debut == "") {
			showAlertError("Le champs ne doit pas être vide");
			setLoading(false);
		} else {
			Axios.put(`/api/alimentutilise/${id}`, {
				date_debut: new Date(newDate_debut).toDateString(),
				alimentId: alimentId,
			})
				.then((response) => {
					getAlimentUtilisees();
					if (response.status === 201)
						showAlertSuccess(response.data.message);
					else showAlertError("Verifiez vos champs et recommencez");
					setLoading(false);
				})
				.catch((error) => {
					showAlertError(error.response.data.message);
					setLoading(false);
				});
		}
	};

	const updateDateFin = (id) => {
		setLoading(true);
		if (newDate_fin == "") {
			showAlertError("Le champs ne doit pas être vide");
			setLoading(false);
		} else {
			Axios.put(`/api/alimentutilise/${id}`, {
				date_fin: new Date(newDate_fin).toDateString(),
				alimentId: alimentId,
			})
				.then((response) => {
					getAlimentUtilisees();
					if (response.status === 201)
						showAlertSuccess(response.data.message);
					else showAlertError("Verifiez vos champs et recommencez");
					setLoading(false);
				})
				.catch((error) => {
					showAlertError(error.response.data.message);
					setLoading(false);
				});
		}
	};

	const deleteAlimentUtilisee = (id) => {
		setLoading(true);
		Axios.delete(`/api/alimentutilise/${alimentId}/${id}`)
			.then((response) => {
				getAlimentUtilisees();
				if (response.status === 200)
					showAlertSuccess(response.data.message);
				else showAlertError("Verifiez vos champs et recommencez");
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
				funtionToUpdate={getAlimentUtilisees}
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
								to={`/pages/vagues/${vagueId}/depenses/aliment`}
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
								Consommations D'aliment
							</h2>
							<div
								style={{
									marginTop: "40px",
									marginBottom: "45px",
								}}
							>
								<div>
									<div class="card card-chart my-3">
										<div class="card-header">
											<div className="row">
												<div className="col-lg-4">
													<h5 class="card-category">
														Stock initial
													</h5>
													<h3 class="card-title">
														<i class="tim-icons icon-app text-warning"></i>{" "}
														<NumberFormat
															value={
																aliment.quantite
																	? aliment.quantite *
																	  aliment.poidsUnitaire
																	: 0
															}
															displayType={"text"}
															thousandSeparator={
																true
															}
															decimalScale={true}
															suffix={" Kg"}
														/>
													</h3>
												</div>
												<div className="col-lg-4">
													<h5 class="card-category">
														Consommation
													</h5>
													<h3 class="card-title">
														<i class="tim-icons icon-chart-pie-36 text-warning"></i>{" "}
														<NumberFormat
															value={
																aliment.qteUtilise
																	? aliment.qteUtilise
																	: 0
															}
															displayType={"text"}
															thousandSeparator={
																true
															}
															decimalScale={true}
															suffix={" Kg"}
														/>{" "}
														(
														<NumberFormat
															value={
																aliment.qteUtilise
																	? (aliment.qteUtilise *
																			100) /
																	  (aliment.quantite *
																			aliment.poidsUnitaire)
																	: 0
															}
															displayType={"text"}
															decimalScale={true}
															thousandSeparator={
																true
															}
															suffix={" %"}
														/>
														)
													</h3>
												</div>
												<div className="col-lg-4">
													<h5 class="card-category">
														Stock restant
													</h5>
													<h3 class="card-title">
														<i class="tim-icons icon-bank text-warning"></i>{" "}
														<NumberFormat
															value={
																aliment.quantite
																	? aliment.quantite *
																			aliment.poidsUnitaire -
																	  aliment.qteUtilise
																	: 0
															}
															displayType={"text"}
															thousandSeparator={
																true
															}
															decimalScale={true}
															suffix={" Kg"}
														/>
													</h3>
												</div>
											</div>
											<button
												className={`btn bg-gradient-warning mx-2 ${
													vague.etat == 2
														? "d-none"
														: ""
												}`}
												data-bs-target="#addConsommationModal"
												data-bs-toggle="modal"
												data-bs-dismiss="modal"
												title="Enregistrer des consommations"
											>
												<i class="tim-icons icon-components text-white font-weight-bold"></i>
											</button>
										</div>

										<div
											className="table-responsive"
											style={{ width: "100%" }}
										>
											<table className="table table-striped">
												<thead>
													<tr>
														<th className="text-center">
															{" "}
															Quantité utilisée
														</th>
														<th className="text-center">
															Valeur{" "}
														</th>
														<th className="text-center">
															{" "}
															Durée d'utilisation
														</th>
														<th className="text-center">
															{" "}
															Début d'utilisation
														</th>
														<th className="text-center">
															{" "}
															Fin d'utilisation
														</th>

														<th className="text-center">
															{" "}
															Actions{" "}
														</th>
													</tr>
												</thead>
												<tbody>
													{alimentUtiliseeList.length ==
													0 ? (
														<tr className="text-center text-danger m-auto">
															Vide
														</tr>
													) : (
														""
													)}
													{alimentUtiliseeList.map(
														(val) => (
															<tr key={val._id}>
																<td className="text-center">
																	{val.recyclage ==
																	"oui" ? (
																		<i
																			class="tim-icons icon-refresh-02 text-success px-2 font-weight-bold"
																			title="Cette consomation est une réutilisation"
																		></i>
																	) : (
																		""
																	)}
																	<NumberFormat
																		value={
																			val.qteUtilise
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
																	/>
																	<div className="mt-2">
																		<Popup
																			trigger={
																				<a className="">
																					{" "}
																					{vague.etat ==
																					2
																						? ""
																						: "Modifier"}{" "}
																				</a>
																			}
																			position="bottom center"
																		>
																			<div className="form-group text-center">
																				<input
																					type="number"
																					placeholder={
																						val.qteUtilise
																					}
																					value={
																						newQteUtilise
																					}
																					onChange={(
																						event
																					) => {
																						setNewQteUtilise(
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
																						updateQteUtilise(
																							val._id
																						);
																					}}
																				>
																					{" "}
																					Mettre
																					à
																					jour
																				</button>
																			</div>
																		</Popup>
																	</div>
																</td>
																<td className="text-center">
																	<NumberFormat
																		value={
																			val.valeurConsommee
																				? val.valeurConsommee
																				: 0
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
																	<NumberFormat
																		value={Math.round(
																			(Date.parse(
																				val.date_fin
																			) -
																				Date.parse(
																					val.date_debut
																				)) /
																				(86400 *
																					1000)
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
																			" Jours"
																		}
																	/>{" "}
																</td>
																<td className="text-center">
																	{moment(
																		new Date(
																			val.date_debut
																		)
																	).format(
																		"DD/MM/YYYY"
																	)}
																	<div className="mt-2">
																		<Popup
																			trigger={
																				<a className="">
																					{" "}
																					{vague.etat ==
																					2
																						? ""
																						: "Modifier"}{" "}
																				</a>
																			}
																			position="bottom center"
																		>
																			<div className="form-group text-center">
																				<input
																					type="date"
																					placeholder={
																						val.date_debut
																					}
																					required
																					value={
																						newDate_debut
																					}
																					onChange={(
																						event
																					) => {
																						setNewDateDebut(
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
																						updateDateDebut(
																							val._id
																						);
																					}}
																				>
																					{" "}
																					Mettre
																					à
																					jour
																				</button>
																			</div>
																		</Popup>
																	</div>
																</td>
																<td className="text-center">
																	{moment(
																		new Date(
																			val.date_fin
																		)
																	).format(
																		"DD/MM/YYYY"
																	)}
																	<div className="mt-2">
																		<Popup
																			trigger={
																				<a className="">
																					{" "}
																					{vague.etat ==
																					2
																						? ""
																						: "Modifier"}{" "}
																				</a>
																			}
																			position="bottom center"
																		>
																			<div className="form-group text-center">
																				<input
																					type="date"
																					placeholder={
																						val.date_fin
																					}
																					value={
																						newDate_fin
																					}
																					required
																					onChange={(
																						event
																					) => {
																						setNewDateFin(
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
																						updateDateFin(
																							val._id
																						);
																					}}
																				>
																					{" "}
																					Mettre
																					à
																					jour
																				</button>
																			</div>
																		</Popup>
																	</div>
																</td>

																<td className="text-center">
																	<Popup
																		trigger={
																			<div className="">
																				<a
																					className="text-danger text-decoration-underline"
																					style={{
																						fontWeight:
																							"bold",
																					}}
																				>
																					{" "}
																					{vague.etat ==
																					2 ? (
																						""
																					) : (
																						<i class="tim-icons icon-trash-simple mx-2"></i>
																					)}{" "}
																				</a>
																			</div>
																		}
																		position="left center"
																	>
																		{(
																			close
																		) => (
																			<div className="p-2">
																				<p>
																					Êtes-vous
																					sur
																					de
																					vouloir
																					supprimer
																					?
																				</p>
																				<button
																					onClick={() => {
																						deleteAlimentUtilisee(
																							val._id
																						);
																					}}
																					className="btn btn-danger"
																				>
																					Oui
																				</button>
																				<button
																					style={{
																						marginLeft:
																							"10px",
																					}}
																					className="btn btn-primary"
																					onClick={
																						close
																					}
																				>
																					Non
																				</button>
																			</div>
																		)}
																	</Popup>
																</td>
															</tr>
														)
													)}
												</tbody>
											</table>
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
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default PageAlimentUtilisee;

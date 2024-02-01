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

function PageSoinsConsomme() {
	const { vagueId, soinsMedicalId } = useParams();
	const [soinsConsommeList, setSoinsConsommeList] = useState(
		JSON.parse(LocalStorage.getItem("soinsConsommeList")) &&
			JSON.parse(LocalStorage.getItem("soinsConsommeList")).length != 0 &&
			JSON.parse(LocalStorage.getItem("soinsConsommeList"))[0]
				.soinsMedicalId == soinsMedicalId
			? JSON.parse(LocalStorage.getItem("soinsConsommeList"))
			: []
	);
	const [soin_medicalList, setSoin_medicalList] = useState(
		JSON.parse(LocalStorage.getItem("soin_medicalList")) &&
			JSON.parse(LocalStorage.getItem("soin_medicalList")).length != 0 &&
			JSON.parse(LocalStorage.getItem("soin_medicalList"))[0].vagueId ==
				vagueId
			? JSON.parse(LocalStorage.getItem("soin_medicalList"))
			: []
	);
	const [soin_medical, setSoin_medical] = useState({});
	const [newQteUtilise, setNewQteUtilise] = useState();
	const [newDate_consommation, setNewDate_consommation] = useState("");
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
		getSoinsConsommes();
	}, []);
	useEffect(() => {
		getSoinsMedical(soin_medicalList);
		getVague(vagueList);
	}, [soinsConsommeList]);

	const getSoinsConsommes = () => {
		if (!soinsConsommeList || soinsConsommeList.length == 0)
			setLoading(true);
		Axios.get(`/api/soinsConsomme/all/${soinsMedicalId}`)
			.then((response) => {
				setSoinsConsommeList(response.data.soinsConsommes);
				LocalStorage.setItem(
					"soinsConsommeList",
					JSON.stringify(response.data.soinsConsommes)
				);
				getSoinsMedical(soin_medicalList);
				setLoading(false);
			})
			.catch(() => {
				showAlertError(error.response.data.message);
				setLoading(false);
			});
	};

	const getSoinsMedical = (soin_medicalList) => {
		let a = {};
		soin_medicalList.forEach((soin_medical) => {
			if (soin_medical._id == soinsMedicalId) {
				a = soin_medical;
			}
		});
		setSoin_medical(a);
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
			Axios.put(`/api/soinsConsomme/${id}`, {
				qteUtilise: newQteUtilise,
				soinsMedicalId: soinsMedicalId,
			})
				.then((response) => {
					getSoinsConsommes();
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

	const updateDateConsommation = (id) => {
		setLoading(true);
		if (newDate_consommation == "") {
			showAlertError("Le champs ne doit pas être vide");
			setLoading(false);
		} else {
			Axios.put(`/api/soinsConsomme/${id}`, {
				date_consommation: new Date(
					newDate_consommation
				).toDateString(),
				soinsMedicalId: soinsMedicalId,
			})
				.then((response) => {
					getSoinsConsommes();
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

	const deleteSoinsConsomme = (id) => {
		setLoading(true);
		Axios.delete(`/api/soinsConsomme/${soinsMedicalId}/${id}`)
			.then((response) => {
				getSoinsConsommes();
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
				funtionToUpdate={getSoinsConsommes}
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
								to={`/pages/vagues/${vagueId}/depenses/soin-medical`}
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
								Consommations De Médicament
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
																soin_medical.quantite
																	? soin_medical.quantite
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
																soin_medical.qteUtilise
																	? soin_medical.qteUtilise
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
																soin_medical.qteUtilise
																	? (soin_medical.qteUtilise *
																			100) /
																	  soin_medical.quantite
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
																soin_medical.quantite
																	? soin_medical.quantite -
																	  soin_medical.qteUtilise
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
															Quantité consommée
														</th>
														<th className="text-center">
															{" "}
															Valeur
														</th>
														<th className="text-center">
															{" "}
															Date de consommation
														</th>
														<th className="text-center">
															{" "}
															Actions{" "}
														</th>
													</tr>
												</thead>
												<tbody>
													{soinsConsommeList.length ==
													0 ? (
														<tr className="text-center text-danger m-auto">
															Vide
														</tr>
													) : (
														""
													)}
													{soinsConsommeList.map(
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
																				? val.qteUtilise
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
																	{moment(
																		new Date(
																			val.date_consommation
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
																						val.date_consommation
																					}
																					required
																					value={
																						newDate_consommation
																					}
																					onChange={(
																						event
																					) => {
																						setNewDate_consommation(
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
																						updateDateConsommation(
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
																						deleteSoinsConsomme(
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

export default PageSoinsConsomme;

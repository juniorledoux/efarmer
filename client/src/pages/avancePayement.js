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

function PageAvancePayement() {
	const { vagueId, venteId } = useParams();
	const [datePayement, setDatePayement] = useState("");
	const [montant, setMontant] = useState();
	const [vente, setVente] = useState({});
	const [avancePayementList, setAvancePayementList] = useState(
		JSON.parse(LocalStorage.getItem("avancePayementList")) &&
			JSON.parse(LocalStorage.getItem("avancePayementList")).length !=
				0 &&
			JSON.parse(LocalStorage.getItem("avancePayementList"))[0].venteId ==
				venteId
			? JSON.parse(LocalStorage.getItem("avancePayementList"))
			: []
	);
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
		getAvancePayement();
	}, []);

	const getAvancePayement = () => {
		if (!avancePayementList || avancePayementList.length == 0)
			setLoading(true);
		Axios.get(`/api/avancePayement/all/${venteId}`)
			.then((response) => {
				setLoading(false);
				LocalStorage.setItem(
					"avancePayementList",
					JSON.stringify(response.data.avances)
				);
				setAvancePayementList(response.data.avances);
				getVente(venteId);
			})
			.catch(() => {
				showAlertError(error.response.data.message);
				setLoading(false);
			});
	};

	const getVente = (venteId) => {
		Axios.get(`api/vente/${venteId}`).then((res) => {
			if (res.status === 200) {
				setVente(res.data);
			}
		});
	};

	const addAvancePayement = (venteId) => {
		setLoading(true);
		Axios.post("/api/avancePayement", {
			venteId: venteId,
			montant: montant,
			date_payement: new Date(datePayement).toDateString(),
		})
			.then((response) => {
				getAvancePayement();
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

	const deleteAvancePayement = (id) => {
		setLoading(true);
		Axios.delete(`/api/avancePayement/${id}`)
			.then((response) => {
				setLoading(false);
				getAvancePayement();
				if (response.status === 200)
					showAlertSuccess(response.data.message);
				else showAlertError("Verifiez vos champs et recommencez");
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
				funtionToUpdate={getAvancePayement}
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
								to={`/pages/vagues/${vagueId}/ventes`}
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
							<h2 className="text-center bg-gradient-primary rounded text-white p-2 col-lg-7 mt-2 mx-auto">
								Montants Avancés
							</h2>
							<div
								style={{
									marginTop: "40px",
									marginBottom: "45px",
								}}
							>
								<div>
									<button
										className={`btn bg-gradient-primary`}
										data-bs-target="#avancePayement"
										data-bs-toggle="modal"
										data-bs-dismiss="modal"
									>
										<i class="tim-icons icon-simple-add text-white font-weight-bold"></i>
									</button>

									<div
										id="avancePayement"
										class="modal fade text-dark"
										aria-hidden="true"
										aria-labelledby="avancePayementLabel"
										tabindex="-1"
										data-bs-keyboard="false"
									>
										<div
											class="modal-dialog modal-dialog-centered modal-md modal-dialog-scrollable"
											style={{
												margin: "auto",
												marginTop: "30px",
											}}
										>
											<form
												onSubmit={(event) => {
													event.preventDefault();
													addAvancePayement(venteId);
												}}
												class="modal-content"
											>
												<div class="modal-header">
													<h5
														class="modal-title"
														id="avancePayementLabel"
													>
														Ajout d'une avance récu
														sur la vente.
													</h5>
													<button
														class="btn-close"
														type="button"
														data-bs-dismiss="modal"
														aria-label="Close"
													></button>
												</div>
												<div class="modal-body py-2 px-3">
													<div className="form-group">
														<label>
															Montant versé par
															l'acheteur{" "}
															<span
																style={{
																	fontWeight:
																		"bold",
																	color: "red",
																}}
															>
																*
															</span>
														</label>
														<input
															required
															type="number"
															min={1}
															onChange={(
																event
															) => {
																setMontant(
																	event.target
																		.value
																);
															}}
															className="form-control"
															placeholder="Entrez le montant avancé par l'acheteur"
															title="Entrez le montant avancé par l'acheteur"
														/>
													</div>
													<div className="form-group">
														<label>
															Date de reception{" "}
															<span
																style={{
																	fontWeight:
																		"bold",
																	color: "red",
																}}
															>
																*
															</span>
														</label>
														<input
															required
															type="date"
															onChange={(
																event
															) => {
																setDatePayement(
																	event.target
																		.value
																);
															}}
															className="form-control"
															placeholder="Entrez la date réelle de reception de l'avance"
															title="Entrez la date réelle de reception de l'avance"
														/>
													</div>
												</div>
												<div class="modal-footer">
													<button
														className="btn btn-outline-primary m-auto btn-fw"
														type="submit"
													>
														{" "}
														Ajouter
													</button>
												</div>
											</form>
										</div>
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
														Montant récu <br />
														(CFA){" "}
													</th>
													<th className="text-center">
														{" "}
														Date de <br />
														reception{" "}
													</th>
													<th className="text-center">
														{" "}
														Actions{" "}
													</th>
												</tr>
											</thead>
											<tbody>
												{avancePayementList.length ==
												0 ? (
													<tr className="text-center text-danger m-auto">
														Vide
													</tr>
												) : (
													""
												)}
												{avancePayementList.map(
													(val) => (
														<tr key={val._id}>
															<td className="text-center">
																<NumberFormat
																	value={
																		val.montant
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
																		val.date_payement
																	)
																).format(
																	"DD/MM/YYYY"
																)}
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
																				<i class="tim-icons icon-trash-simple mx-2"></i>
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
																					deleteAvancePayement(
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

export default PageAvancePayement;

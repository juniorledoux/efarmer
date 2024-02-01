import React, { useState, useEffect } from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Link,
	Navigate,
} from "react-router-dom";
import NavBar from "../../components/utils/navBar";
import LocalStorage from "localStorage";
import Popup from "reactjs-popup";
import moment from "moment";
import { useParams } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";
import NumberFormat from "react-number-format";
import Axios from "axios";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend);
import { Line } from "react-chartjs-2";
import {
	Provider as AlertProvider,
	useAlert,
	positions,
	types,
	transitions,
} from "react-alert";

function PagePerte() {
	const { vagueId } = useParams();
	const [loading, setLoading] = useState(false);
	const [vagueList, setVagueList] = useState(
		JSON.parse(LocalStorage.getItem("vagueList"))
			? JSON.parse(LocalStorage.getItem("vagueList"))
			: []
	);
	const [vague, setVague] = useState({});
	const [perteList, setPerteList] = useState(
		JSON.parse(LocalStorage.getItem("perteList")) &&
			JSON.parse(LocalStorage.getItem("perteList")).length != 0 &&
			JSON.parse(LocalStorage.getItem("perteList"))[0].vagueId == vagueId
			? JSON.parse(LocalStorage.getItem("perteList"))
			: []
	);
	const [perteOrdonnerList, setPerteOrdonnerList] = useState(
		JSON.parse(LocalStorage.getItem("perteOrdonnerList")) &&
			JSON.parse(LocalStorage.getItem("perteOrdonnerList")).length != 0 &&
			JSON.parse(LocalStorage.getItem("perteOrdonnerList"))[0].vagueId ==
				vagueId
			? JSON.parse(LocalStorage.getItem("perteOrdonnerList"))
			: []
	);
	const [newNbrePerte, setNewNbrePerte] = useState(0);
	const Alert = useAlert();
	const [chartData, setChartData] = useState({
		labels: [],
		datasets: [
			{
				label: "Montant Perdu ",
				data: [],
				borderColor: "#E91E30",
				borderWidth: 1,
			},
		],
	});
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

	const getPertes = () => {
		if (!perteList || perteList.length == 0) setLoading(true);
		Axios.get(`/api/perte/all/${vagueId}`)
			.then((response) => {
				setLoading(false);
				if (response.status === 200) {
					LocalStorage.setItem(
						"perteList",
						JSON.stringify(response.data.pertes)
					);
					LocalStorage.setItem(
						"perteOrdonnerList",
						JSON.stringify(response.data.perteOrdonner)
					);
					setPerteOrdonnerList(response.data.perteOrdonner);
					setPerteList(response.data.pertes);
				}
			})
			.catch((error) => {
				setLoading(false);
				showAlertError(error.response.data.message);
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
		getPertes();
	}, []);

	useEffect(() => {
		setChartData({
			labels: perteOrdonnerList.map((perte) =>
				new Date(perte.date_perte).toLocaleDateString()
			),
			datasets: [
				{
					label: "Montant Perdu ",
					data: perteOrdonnerList.map((perte) =>
						Math.round(perte.valeur_perdu)
					),
					borderColor: "#E91E30",
					backgroundColor: "#248AFD",
					borderWidth: 1,
					lineTension: 0.5,
				},
			],
		});
	}, [perteList, perteOrdonnerList]);

	useEffect(() => {
		getVagues();
		getVague(vagueList);
	}, [perteList]);

	const updateQtePerdue = (id) => {
		setLoading(true);
		if (newNbrePerte == "") {
			showAlertError("Le champs ne doit pas être vide");
			setLoading(false);
		} else {
			Axios.put(`/api/perte/${id}`, {
				qte_perdu: newNbrePerte,
			})
				.then((response) => {
					getPertes();
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

	const deletePerte = (id) => {
		setLoading(true);
		Axios.delete(`/api/perte/${id}`)
			.then((response) => {
				getPertes();
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

	const sommeTotalPerte = (id) => {
		let somme = 0;
		perteList.forEach((perte) => {
			somme += perte.valeur_perdu;
		});
		return somme;
	};

	return (
		<div>
			<NavBar
				VAGUEID={vagueId}
				vagueList={vagueList}
				funtionToUpdate={getPertes}
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
							<h2 className="text-center bg-gradient-danger rounded text-white p-2 col-lg-7 mt-2 mx-auto">
								Pertes
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
												<div className="col-lg-3">
													<h5 class="card-category">
														Total Pertes (CFA)
													</h5>
													<h3 class="card-title">
														<i class="tim-icons icon-alert-circle-exc text-danger"></i>{" "}
														<NumberFormat
															value={
																vague.valeur_animaux_perdu
															}
															displayType={"text"}
															thousandSeparator={
																true
															}
															decimalScale={true}
															suffix={" XAF"}
														/>
													</h3>
												</div>
												<div className="col-lg-3">
													<h5 class="card-category">
														Décès
													</h5>
													<h3 class="card-title">
														<i class="tim-icons icon-sound-wave text-danger"></i>{" "}
														<span className="font-weight-bold">
															<NumberFormat
																value={
																	vague.animaux_perdu
																		? vague.animaux_perdu
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
																	" Sujets"
																}
															/>{" "}
															(
															<NumberFormat
																value={
																	vague.animaux_perdu
																		? (vague.animaux_perdu *
																				100) /
																		  vague.qte_animaux
																		: 0
																}
																displayType={
																	"text"
																}
																decimalScale={
																	true
																}
																thousandSeparator={
																	true
																}
																suffix={" %"}
															/>
															)
														</span>
													</h3>
												</div>
												<div className="col-lg-3">
													<h5 class="card-category">
														Stock initial
													</h5>
													<h3 class="card-title">
														<i class="tim-icons icon-app text-danger"></i>{" "}
														<NumberFormat
															value={
																vague.qte_animaux
																	? vague.qte_animaux
																	: 0
															}
															displayType={"text"}
															thousandSeparator={
																true
															}
															decimalScale={true}
															suffix={" Sujets"}
														/>
													</h3>
												</div>
												<div className="col-lg-3">
													<h5 class="card-category">
														Stock actuel
													</h5>
													<h3 class="card-title">
														<i class="tim-icons icon-bank text-danger"></i>{" "}
														<NumberFormat
															value={
																vague.enStock
																	? vague.enStock
																	: 0
															}
															displayType={"text"}
															thousandSeparator={
																true
															}
															decimalScale={true}
															suffix={" Sujets"}
														/>
													</h3>
												</div>
											</div>
											<button
												className={`btn bg-gradient-danger mx-2 ${
													vague.etat == 2
														? "d-none"
														: ""
												}`}
												data-bs-target="#ajoutPerte"
												data-bs-toggle="modal"
												data-bs-dismiss="modal"
												title="Enregistrer des pertes"
											>
												<i class="tim-icons icon-alert-circle-exc text-white font-weight-bold"></i>
											</button>
										</div>
										<div class="card-body">
											<div class="chart-area">
												<Line
													data={chartData}
													height={
														window.outerWidth < 500
															? "500px"
															: "auto"
													}
													options={{
														plugins: {
															title: {
																display: true,
																text: "Statistiques des montants des pertes",
															},
															legend: {
																display: true,
															},
														},
													}}
												/>
											</div>
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
														Date{" "}
													</th>
													<th className="text-center">
														{" "}
														Nombre de décès{" "}
													</th>
													<th className="text-center">
														{" "}
														Coùt total (CFA)
													</th>
													<th className="text-center">
														{" "}
														Actions{" "}
													</th>
												</tr>
											</thead>
											<tbody>
												{perteList.length == 0 ? (
													<tr className="text-center text-danger m-auto">
														Vide
													</tr>
												) : (
													""
												)}
												{perteList.map((val) => (
													<tr key={val._id}>
														<td className="text-center">
															{moment(
																new Date(
																	val.date_perte
																)
															).format(
																"DD/MM/YYYY"
															)}
														</td>
														<td className="text-center">
															<NumberFormat
																value={
																	val.qte_perdu
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
																suffix={""}
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
																			type="text"
																			placeholder={
																				val.qte_perdu
																			}
																			onChange={(
																				event
																			) => {
																				setNewNbrePerte(
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
																				updateQtePerdue(
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
																	val.valeur_perdu
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
																suffix={" XAF"}
															/>{" "}
															(
															<NumberFormat
																value={
																	val.valeur_perdu /
																	val.qte_perdu
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
																	" XAF/Sujet"
																}
															/>
															)
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
																{(close) => (
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
																				deletePerte(
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
												))}
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
	);
}

export default PagePerte;

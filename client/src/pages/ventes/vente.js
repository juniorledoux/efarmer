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
import NumberFormat from "react-number-format";
import Popup from "reactjs-popup";
import moment from "moment";
import { useParams } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";
import Axios from "axios";
import { Line } from "react-chartjs-2";
import {
	Provider as AlertProvider,
	useAlert,
	positions,
	types,
	transitions,
} from "react-alert";

function PageVente() {
	const { vagueId } = useParams();
	const [loading, setLoading] = useState(false);
	const [vagueList, setVagueList] = useState(
		JSON.parse(LocalStorage.getItem("vagueList"))
			? JSON.parse(LocalStorage.getItem("vagueList"))
			: []
	);
	const [vague, setVague] = useState({});
	const [venteList, setVenteList] = useState(
		JSON.parse(LocalStorage.getItem("venteList")) &&
			JSON.parse(LocalStorage.getItem("venteList")).length != 0 &&
			JSON.parse(LocalStorage.getItem("venteList"))[0].vagueId == vagueId
			? JSON.parse(LocalStorage.getItem("venteList"))
			: []
	);
	const [newDateVente, setNewDateVente] = useState("");
	const [newNbreSujetVendu, setNewNbreSujetVendu] = useState(0);
	const [newMontantVente, setNewMontantVente] = useState(0);
	const [newPoidsTotalVente, setNewPoidsTotalVente] = useState(0);
	const [newModeEncaissement, setNewModeEncaissement] = useState("Espèces");
	const [totalRecu, setTotalRecu] = useState(0);
	const [totalImmediat, setTotaImmediat] = useState(0);
	const [totalDiffere, setTotalDiffere] = useState(0);
	const [totalAttendu, setTotalAttendu] = useState(0);
	const [quantiteVendu, setQuantiteVendu] = useState(0);
	const [selectQuery, setSelectQuery] = useState({
		select: "tout",
		query: "tout",
	});
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

	const getVentes = () => {
		if (!venteList || venteList.length == 0) setLoading(true);
		Axios.get(`/api/vente/all/${vagueId}`)
			.then((response) => {
				setLoading(false);
				if (response.status === 200) {
					LocalStorage.setItem(
						"venteList",
						JSON.stringify(response.data.ventes)
					);
					setVenteList(response.data.ventes);
				}
			})
			.catch(() => {
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
		getVentes();
	}, []);

	useEffect(() => {
		getVague(vagueList);
		getVagues();
		getQuantiteVendu();
		getTotalImmediat();
		getTotalDiffere();
		getTotalRecuEtAttendu();
	}, [venteList]);

	const getQuantiteVendu = () => {
		let qteVendu = 0;
		venteList.map((vente) => {
			qteVendu += vente.qte_vendu;
		});
		setQuantiteVendu(qteVendu);
	};
	const getTotalImmediat = () => {
		let totalP = 0;
		venteList.map((vente) => {
			if (vente.mode_payement == "Immédiat") {
				totalP += vente.prix_vente;
			}
		});
		setTotaImmediat(totalP);
	};
	const getTotalDiffere = () => {
		let totalC = 0;
		venteList.map((vente) => {
			if (vente.mode_payement != "Immédiat") {
				totalC += vente.prix_vente;
			}
		});
		setTotalDiffere(totalC);
	};
	const getTotalRecuEtAttendu = () => {
		let recu = 0;
		let attendu = 0;
		venteList.map((vente) => {
			recu += vente.montant_avance;
			attendu += vente.montant_restant;
		});
		setTotalRecu(recu);
		setTotalAttendu(attendu);
	};

	const updateVenteACredit = (id, lastValue) => {
		setLoading(true);
		if (lastValue == "Immédiat") {
			Axios.put(`/api/vente/${id}`, {
				mode_payement: "Différé",
			}).then((response) => {
				getVentes();
				if (response.status === 201)
					showAlertSuccess(response.data.message);
				setLoading(false);
			});
		} else {
			Axios.put(`/api/vente/${id}`, {
				mode_payement: "Immédiat",
			})
				.then((response) => {
					getVentes();
					if (response.status === 201)
						showAlertSuccess(response.data.message);
					setLoading(false);
				})
				.catch((error) => {
					showAlertError(error.response.data.message);
					setLoading(false);
				});
		}
	};
	const updateQteVendu = (id) => {
		setLoading(true);
		if (newNbreSujetVendu == "") {
			showAlertError("Le champs ne doit pas être vide");
			setLoading(false);
		} else {
			Axios.put(`/api/vente/${id}`, {
				qte_vendu: newNbreSujetVendu,
			})
				.then((response) => {
					getVentes();
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
	const updateMontantVente = (id) => {
		setLoading(true);
		if (newMontantVente == "") {
			showAlertError("Le champs ne doit pas être vide");
			setLoading(false);
		} else {
			Axios.put(`/api/vente/${id}`, {
				prix_vente: newMontantVente,
			})
				.then((response) => {
					getVentes();
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
	const updatePoidsTotalVente = (id) => {
		setLoading(true);
		if (newPoidsTotalVente == "") {
			showAlertError("Le champs ne doit pas être vide");
			setLoading(false);
		} else {
			Axios.put(`/api/vente/${id}`, {
				poids_total_vendu: newPoidsTotalVente,
			})
				.then((response) => {
					getVentes();
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
	const updateModeEncaissement = (id) => {
		setLoading(true);
		if (newModeEncaissement == "") {
			showAlertError("Le champs ne doit pas être vide");
			setLoading(false);
		} else {
			Axios.put(`/api/vente/${id}`, {
				mode_encaissement: newModeEncaissement,
			})
				.then((response) => {
					getVentes();
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
	const updateDateVente = (id) => {
		setLoading(true);
		if (newDateVente == "") {
			showAlertError("Le champs ne doit pas être vide");
			setLoading(false);
		} else {
			Axios.put(`/api/vente/${id}`, {
				date_vente: new Date(newDateVente).toDateString(),
			})
				.then((response) => {
					getVentes();
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
	const deleteVente = (id) => {
		setLoading(true);
		Axios.delete(`/api/vente/${vagueId}/${id}`)
			.then((response) => {
				getVentes();
				if (response.status === 200)
					showAlertSuccess(response.data.message);
				setLoading(false);
			})
			.catch((error) => {
				showAlertError(error.response.data.message);
				setLoading(false);
			});
	};

	useEffect(() => {
		filterVenteList(selectQuery);
	}, [selectQuery]);

	const filterVenteList = (selectQuery) => {
		let ventes =
			JSON.parse(LocalStorage.getItem("venteList")) &&
			JSON.parse(LocalStorage.getItem("venteList")).length != 0 &&
			JSON.parse(LocalStorage.getItem("venteList"))[0].vagueId == vagueId
				? JSON.parse(LocalStorage.getItem("venteList"))
				: [];
		if (selectQuery.select == "ModePayement") {
			setVenteList(
				ventes.filter((val) => {
					return val.mode_payement == selectQuery.query;
				})
			);
		} else if (selectQuery.select == "ModeEncaissement") {
			setVenteList(
				ventes.filter((val) => {
					return val.mode_encaissement == selectQuery.query;
				})
			);
		} else {
			setVenteList(ventes);
		}
	};

	const filter = () => {
		return (
			<div className="p-2">
				<h5 className="text-center text-success font-weight-bold">
					Trier par ?
				</h5>
				<p className=" font-weight-bold">
					{selectQuery.query == "tout" ? (
						<input
							type={"radio"}
							name="filterVenteList"
							id="toutAfficher"
							defaultChecked
							onInput={() => {
								setSelectQuery({
									select: "tout",
									query: "tout",
								});
							}}
						/>
					) : (
						<input
							type={"radio"}
							name="filterVenteList"
							id="toutAfficher"
							onInput={() => {
								setSelectQuery({
									select: "tout",
									query: "tout",
								});
							}}
						/>
					)}
					<label for="toutAfficher" className="mx-2">
						Tout afficher
					</label>
				</p>
				<p className="">
					<p className="font-weight-bold">Mode de payement</p>
					<p className="mx-3">
						{selectQuery.query == "Immédiat" ? (
							<input
								type={"radio"}
								name="filterVenteList"
								id="modePayementImmediat"
								defaultChecked
								onInput={() => {
									setSelectQuery({
										select: "ModePayement",
										query: "Immédiat",
									});
								}}
							/>
						) : (
							<input
								type={"radio"}
								name="filterVenteList"
								id="modePayementImmediat"
								onInput={() => {
									setSelectQuery({
										select: "ModePayement",
										query: "Immédiat",
									});
								}}
							/>
						)}
						<label className="mx-2" for="modePayementImmediat">
							Immédiat
						</label>
					</p>
					<p className="mx-3">
						{selectQuery.query == "Différé" ? (
							<input
								type={"radio"}
								name="filterVenteList"
								id="modePayementDiffere"
								defaultChecked
								onInput={() => {
									setSelectQuery({
										select: "ModePayement",
										query: "Différé",
									});
								}}
							/>
						) : (
							<input
								type={"radio"}
								name="filterVenteList"
								id="modePayementDiffere"
								onInput={() => {
									setSelectQuery({
										select: "ModePayement",
										query: "Différé",
									});
								}}
							/>
						)}
						<label className="mx-2" for="modePayementDiffere">
							Différé
						</label>
					</p>
				</p>
				<p className="">
					<p className="font-weight-bold">Mode d'encaissement</p>
					<p className="mx-3">
						{selectQuery.query == "Espèces" ? (
							<input
								type={"radio"}
								name="filterVenteList"
								id="modeEncaissementEspece"
								defaultChecked
								onInput={() => {
									setSelectQuery({
										select: "ModeEncaissement",
										query: "Espèces",
									});
								}}
							/>
						) : (
							<input
								type={"radio"}
								name="filterVenteList"
								id="modeEncaissementEspece"
								onInput={() => {
									setSelectQuery({
										select: "ModeEncaissement",
										query: "Espèces",
									});
								}}
							/>
						)}
						<label className="mx-2" for="modeEncaissementEspece">
							Espèces
						</label>
					</p>
					<p className="mx-3">
						{selectQuery.query == "Virement" ? (
							<input
								type={"radio"}
								name="filterVenteList"
								id="modeEncaissementVirement"
								defaultChecked
								onInput={() => {
									setSelectQuery({
										select: "ModeEncaissement",
										query: "Virement",
									});
								}}
							/>
						) : (
							<input
								type={"radio"}
								name="filterVenteList"
								id="modeEncaissementVirement"
								onInput={() => {
									setSelectQuery({
										select: "ModeEncaissement",
										query: "Virement",
									});
								}}
							/>
						)}
						<label className="mx-2" for="modeEncaissementVirement">
							Virement
						</label>
					</p>
					<p className="mx-3">
						{selectQuery.query == "Mobile" ? (
							<input
								type={"radio"}
								name="filterVenteList"
								id="modeEncaissementMobile"
								defaultChecked
								onInput={() => {
									setSelectQuery({
										select: "ModeEncaissement",
										query: "Mobile",
									});
								}}
							/>
						) : (
							<input
								type={"radio"}
								name="filterVenteList"
								id="modeEncaissementMobile"
								onInput={() => {
									setSelectQuery({
										select: "ModeEncaissement",
										query: "Mobile",
									});
								}}
							/>
						)}
						<label className="mx-2" for="modeEncaissementMobile">
							Mobile
						</label>
					</p>
				</p>
			</div>
		);
	};

	return (
		<div>
			<NavBar
				VAGUEID={vagueId}
				vagueList={vagueList}
				funtionToUpdate={getVentes}
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
							<h2 className="text-center bg-gradient-success rounded text-white p-2 col-lg-7 mt-2 mx-auto">
								Ventes
							</h2>
							<div
								style={{
									marginTop: "40px",
									marginBottom: "45px",
								}}
							>
								<div>
									<div className="row justify-content-end">
										<div className="w-auto">
											<Popup
												trigger={
													<div className="">
														<button
															className={`btn bg-gradient-success`}
															title="Trier la table des ventes"
														>
															<i class="tim-icons icon-bullet-list-67 text-white font-weight-bold"></i>
														</button>
													</div>
												}
												position="left top"
											>
												{(close) => filter()}
											</Popup>
										</div>
									</div>

									<div class="card card-chart my-3">
										<div class="card-header">
											<div className="row">
												<div className="col-4">
													<h5 class="card-category">
														Quantité vendue
													</h5>
													<h3 class="card-title">
														<i class="tim-icons icon-cart text-success"></i>{" "}
														<NumberFormat
															value={
																quantiteVendu
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
												<div className="col-4">
													<h5 class="card-category">
														Quantité restante
													</h5>
													<h3 class="card-title">
														<i class="tim-icons icon-cart text-danger"></i>{" "}
														<span className="font-weight-bold">
															<NumberFormat
																value={
																	vague.enStock
																		? vague.enStock
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
															/>
														</span>
													</h3>
												</div>
												<div className="col-4">
													<h5 class="card-category">
														Prix moyen (CFA)
													</h5>
													<h3 class="card-title">
														<i class="tim-icons icon-chart-pie-36 text-success"></i>{" "}
														<NumberFormat
															value={
																quantiteVendu
																	? (totalRecu +
																			totalAttendu) /
																	  quantiteVendu
																	: 0
															}
															displayType={"text"}
															thousandSeparator={
																true
															}
															decimalScale={true}
															suffix={
																" XAF/sujet"
															}
														/>
													</h3>
												</div>
											</div>
											<div className="row">
												<div className="col-4">
													<h5 class="card-category">
														Total recu
													</h5>
													<h3 class="card-title">
														<i class="tim-icons icon-wallet-43 text-success"></i>{" "}
														<NumberFormat
															value={totalRecu}
															displayType={"text"}
															thousandSeparator={
																true
															}
															decimalScale={true}
															suffix={" XAF"}
														/>
													</h3>
												</div>
												<div className="col-4">
													<h5 class="card-category">
														Total attendu
													</h5>
													<h3 class="card-title">
														<i class="tim-icons icon-wallet-43 text-danger"></i>{" "}
														<NumberFormat
															value={totalAttendu}
															displayType={"text"}
															thousandSeparator={
																true
															}
															decimalScale={true}
															suffix={" XAF"}
														/>
													</h3>
												</div>
												<div className="col-4">
													<h5 class="card-category">
														Total des ventes
													</h5>
													<h3 class="card-title">
														<i class="tim-icons icon-coins text-success"></i>{" "}
														<NumberFormat
															value={
																totalRecu +
																totalAttendu
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
											</div>
											<div className="row">
												<div className="col-4">
													<h5 class="card-category">
														Total immédiat
													</h5>
													<h3 class="card-title">
														<i class="tim-icons icon-money-coins text-success"></i>{" "}
														<NumberFormat
															value={
																totalImmediat
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
												<div className="col-4">
													<h5 class="card-category">
														Total différé
													</h5>
													<h3 class="card-title">
														<i class="tim-icons icon-money-coins text-danger"></i>{" "}
														<NumberFormat
															value={totalDiffere}
															displayType={"text"}
															thousandSeparator={
																true
															}
															decimalScale={true}
															suffix={" XAF"}
														/>
													</h3>
												</div>
											</div>
											<button
												className={`btn bg-gradient-success mx-2 ${
													vague.etat == 2
														? "d-none"
														: ""
												}`}
												data-bs-target="#ajoutVente"
												data-bs-toggle="modal"
												data-bs-dismiss="modal"
												title="Enregistrer des ventes"
											>
												<i class="tim-icons icon-coins text-white font-weight-bold"></i>
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
															Acheteur
															<br />
															(quantité)
														</th>
														<th className="text-center">
															Prix total
														</th>
														<th className="text-center">
															Poids total
														</th>
														<th className="text-center">
															Mode de Payement
															<br />
															(encaissement)
														</th>
														<th className="text-center">
															Montant récu
															<br />
															(restant)
														</th>
														<th className="text-center">
															Vendu le
														</th>
														<th className="text-center">
															{" "}
															Actions{" "}
														</th>
													</tr>
												</thead>
												<tbody>
													{venteList.length == 0 ? (
														<tr className="text-center text-danger m-auto">
															Vide
														</tr>
													) : (
														""
													)}
													{venteList.map((vente) => (
														<tr
															key={vente._id}
															style={{
																background:
																	vente.mode_payement ==
																	"Immédiat"
																		? "#58d8a3"
																		: "#adb5bd",
															}}
														>
															<td className="text-center">
																{vente.acheteur}
																<p className="mt-1">
																	(
																	<NumberFormat
																		value={
																			vente.qte_vendu
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
																			" sujets"
																		}
																	/>
																	)
																</p>
																<div className="mt-">
																	<Popup
																		trigger={
																			<a className="">
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
																				min={
																					1
																				}
																				title="Modifier la quantité vendue"
																				placeholder={
																					vente.qte_vendu
																				}
																				onChange={(
																					event
																				) => {
																					setNewNbreSujetVendu(
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
																					updateQteVendu(
																						vente._id
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
																		vente.prix_vente
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
																<p className="mt-1">
																	(
																	<NumberFormat
																		value={
																			vente.prix_vente /
																			vente.qte_vendu
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
																			" XAF/sujet"
																		}
																	/>
																	)
																</p>
																<div className="mt-">
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
																				min={
																					1
																				}
																				title="Modifier le montant de la vente"
																				placeholder={
																					vente.prix_vente
																				}
																				onChange={(
																					event
																				) => {
																					setNewMontantVente(
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
																					updateMontantVente(
																						vente._id
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
																		vente.poids_total_vendu
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
																<p className="mt-1">
																	(
																	<NumberFormat
																		value={
																			vente.poids_total_vendu
																				? vente.prix_vente /
																				  vente.poids_total_vendu
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
																			" XAF/kg"
																		}
																	/>
																	)
																</p>
																<div className="mt-">
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
																				min={
																					1
																				}
																				step={
																					0.1
																				}
																				title="Modifier le poids total de la vente"
																				placeholder={
																					vente.poids_total_vendu
																				}
																				onChange={(
																					event
																				) => {
																					setNewPoidsTotalVente(
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
																					updatePoidsTotalVente(
																						vente._id
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
																{
																	vente.mode_payement
																}{" "}
																<div className="mt-1">
																	<a
																		className=""
																		onClick={() => {
																			updateVenteACredit(
																				vente._id,
																				vente.mode_payement
																			);
																		}}
																	>
																		{" "}
																		{vague.etat ==
																		2
																			? ""
																			: "Changer"}{" "}
																	</a>
																</div>
																<p className="mt-1">
																	(
																	{
																		vente.mode_encaissement
																	}
																	)
																</p>
																<div className="mt-">
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
																			<select
																				className="form-control"
																				required
																				onChange={(
																					event
																				) =>
																					setNewModeEncaissement(
																						event
																							.target
																							.value
																					)
																				}
																				placeholder="Entrez le mode d'encaissement"
																				title="Entrez le mode d'encaissement"
																			>
																				<option
																					value={
																						"Espèces"
																					}
																				>
																					Espèces
																				</option>
																				<option
																					value={
																						"Virement"
																					}
																				>
																					Virement
																				</option>
																				<option
																					value={
																						"Mobile"
																					}
																				>
																					Mobile
																				</option>
																			</select>
																			<button
																				className="btn btn-outline-success mt-2 btn-fw"
																				onClick={() => {
																					updateModeEncaissement(
																						vente._id
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
																		vente.montant_avance
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
																<p className="mt-1 text-danger font-weight-bold">
																	(
																	<NumberFormat
																		value={
																			vente.montant_restant
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
																	)
																</p>
																{vente.mode_payement ==
																"Différé" ? (
																	<p className="mt-">
																		<Link
																			to={`/pages/vagues/${vagueId}/ventes/${vente._id}/avance-payement`}
																		>
																			Voir
																			les
																			avances
																		</Link>
																	</p>
																) : (
																	""
																)}
															</td>
															<td className="text-center">
																{moment(
																	vente.date_vente
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
																				title="Modifier la date de la vente"
																				placeholder={
																					vente.date_vente
																				}
																				required
																				onChange={(
																					event
																				) => {
																					setNewDateVente(
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
																					updateDateVente(
																						vente._id
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
																		<div className="mt-3">
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
																					deleteVente(
																						vente._id
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

export default PageVente;

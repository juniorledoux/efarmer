import React, { useState, useEffect } from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Link,
	Navigate,
} from "react-router-dom";
import NavBar from "../../components/utils/navBar";
import "../../components/dashboard.css";
import LocalStorage from "localStorage";
import Axios from "axios";
import moment from "moment";
import Popup from "reactjs-popup";
import NumberFormat from "react-number-format";
import "reactjs-popup/dist/index.css";
import {
	Provider as AlertProvider,
	useAlert,
	positions,
	types,
	transitions,
} from "react-alert";
import ClipLoader from "react-spinners/ClipLoader";
import { useParams } from "react-router-dom";

function PageEau() {
	const { vagueId } = useParams();
	const [eaux, setEaux] = useState({});
	const [newTitre, setNewTitre] = useState("");
	const [newPrix, setNewPrix] = useState(0);
	const [newSourceFinancementId, setNewSourceFinancementId] = useState(
		"1111afe11f6111f11fce111c"
	);
	const [isBudgetPropre, setIsBudgetPropre] = useState(true);
	const [eauList, setEauList] = useState(
		JSON.parse(LocalStorage.getItem("eauList")) &&
			JSON.parse(LocalStorage.getItem("eauList")).length != 0 &&
			JSON.parse(LocalStorage.getItem("eauList"))[0].vagueId == vagueId
			? JSON.parse(LocalStorage.getItem("eauList"))
			: []
	);
	const [profitsList, setProfitsList] = useState(
		JSON.parse(LocalStorage.getItem("profitsList")) &&
			JSON.parse(LocalStorage.getItem("profitsList")).length != 0
			? JSON.parse(LocalStorage.getItem("profitsList"))
			: []
	);
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
		getVague(vagueList);
		getEaux();
	}, []);

	const getEaux = () => {
		if (!eauList || eauList.length == 0) setLoading(true);
		Axios.get(`/api/eau/all/${vagueId}`)
			.then((response) => {
				setEauList(response.data);
				LocalStorage.setItem("eauList", JSON.stringify(response.data));
				getVague(vagueList);
				getEauPrix(vagueId);
				setLoading(false);
			})
			.catch(() => {
				showAlertError(error.response.data.message);
				setLoading(false);
			});
	};

	const updateEauTitre = (id) => {
		setLoading(true);
		if (newTitre == "") {
			showAlertError("Le champs ne doit pas être vide");
			setLoading(false);
		} else {
			Axios.put(`/api/eau/${id}`, {
				titre: newTitre,
				_id: id,
			})
				.then((response) => {
					getEaux();
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

	const updateEauPrix = (id) => {
		setLoading(true);
		if (newPrix == "") {
			showAlertError("Le champs ne doit pas être vide");
			setLoading(false);
		} else {
			Axios.put(`/api/eau/${id}`, {
				prix: newPrix,
				_id: id,
			})
				.then((response) => {
					getEaux();
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

	const updateSourceFinancement = (id, prix) => {
		setLoading(true);
		if (newSourceFinancementId == "") {
			showAlertError("Le champs ne doit pas être vide");
			setLoading(false);
		} else {
			Axios.put(`/api/eau/${id}`, {
				prix: prix,
				source_financementId: newSourceFinancementId,
				_id: id,
			})
				.then((response) => {
					getEaux();
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

	// Initially, no file is selected
	const [selectedFile, setSelectedFile] = useState("");

	const onFileChange = (event) => {
		// Update the state
		setSelectedFile(event.target.files[0]);
	};

	// On file upload (click the upload button)
	const onFileUpload = (id) => {
		setLoading(true);
		// Create an object of formData
		let formData = new FormData();

		// Update the formData object
		formData.append("file", selectedFile);

		// Details of the uploaded file
		console.log(formData);
		console.log(selectedFile);

		// Request made to the backend api
		// Send formData object
		//axios.post("/api/aliments", formData);

		if (selectedFile == null) {
			showAlertError("Le champs ne doit pas être vide");
			setLoading(false);
		} else {
			Axios.put(`/api/eau/${id}`, formData, {
				facture: selectedFile.name,
				_id: id,
			})
				.then((response) => {
					getEaux();
					showAlertSuccess(response.data.message);
					setLoading(false);
				})
				.catch((error) => {
					showAlertError(error.response.data.message);
					setLoading(false);
				});
		}
	};

	const deleteEau = (id) => {
		setLoading(true);
		Axios.delete(`/api/eau/${id}`)
			.then((response) => {
				getEaux();
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

	const getEauPrix = (vagueId) => {
		Axios.get(`api/cout/eau/${vagueId}`).then((res) => {
			if (res.status === 200) {
				setEaux(res.data);
			}
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

	const setProgressBar = () => {
		let progressbar;
		let budget_eau = vague.budget_eau == 0 ? 1 : vague.budget_eau;
		progressbar = (eaux.prix * 100) / budget_eau;
		return progressbar;
	};
	return (
		<div>
			<NavBar
				VAGUEID={vagueId}
				vagueList={vagueList}
				funtionToUpdate={getEaux}
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
								to={`/pages/vagues/${vagueId}/depenses`}
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
								Dépenses En Eau
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
											<div className="col-lg-12 my-2">
												<div className="d-flex align-items-center justify-content-between px-2">
													<div className="">
														{
															<NumberFormat
																value={
																	eaux.prix
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
															/>
														}
													</div>
													<div className="">
														{
															<NumberFormat
																value={
																	vague.budget_eau
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
															/>
														}
													</div>
												</div>
												<div className="">
													<div className="progress progress-md">
														<div
															className={`progress-bar ${
																setProgressBar() <
																51
																	? "bg-gradient-success"
																	: setProgressBar() >
																			50 &&
																	  setProgressBar() <
																			85
																	? "bg-gradient-warning"
																	: "bg-gradient-danger"
															}`}
															role="progressbar"
															style={{
																width: `${setProgressBar()}%`,
															}}
															aria-valuenow="70"
															aria-valuemin="0"
															aria-valuemax="100"
														></div>
													</div>
												</div>
											</div>
											<button
												className={`btn bg-gradient-warning mx-2 ${
													vague.etat == 2
														? "d-none"
														: ""
												}`}
												data-bs-target="#ajoutDepense"
												data-bs-toggle="modal"
												data-bs-dismiss="modal"
												title="Ajouter un nouvel achat ou une dépenses"
											>
												<i class="tim-icons icon-chart-pie-36 text-white font-weight-bold"></i>
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
															Facture{" "}
														</th>
														<th className="text-center">
															{" "}
															Titre{" "}
														</th>
														<th className="text-center">
															{" "}
															Prix total
														</th>
														<th className="text-center">
															{" "}
															Source de
															<br /> financement{" "}
														</th>
														<th className="text-center">
															{" "}
															Date{" "}
														</th>
														<th className="text-center">
															{" "}
															Actions{" "}
														</th>
													</tr>
												</thead>
												<tbody>
													{eauList.length == 0 ? (
														<tr className="text-center text-danger m-auto">
															Vide
														</tr>
													) : (
														""
													)}
													{eauList.map((val) => (
														<tr key={val._id}>
															<td className="py-1">
																<a
																	href={
																		val.facture
																	}
																	target="_Blank"
																>
																	Voir la
																	facture
																</a>
																<br />
																<br />
																<Popup
																	trigger={
																		<a className="">
																			{" "}
																			Modifier
																			la
																			facture{" "}
																		</a>
																	}
																	position="bottom center"
																>
																	<div>
																		<div>
																			<div class="custom-file">
																				<input
																					type="file"
																					name="file"
																					className="custom-file-input"
																					id="inputGroupFile04"
																					onChange={
																						onFileChange
																					}
																				/>
																				<label
																					class="custom-file-label"
																					for="inputGroupFile04"
																				>
																					Choisir
																					un
																					fichier
																				</label>
																			</div>
																			<div class="input-group-append float-end pt-2">
																				<button
																					className="btn btn-outline-info"
																					onClick={() => {
																						onFileUpload(
																							val._id
																						);
																					}}
																				>
																					Envoyer
																				</button>
																			</div>
																		</div>
																	</div>
																</Popup>
															</td>
															<td className="text-center">
																{val.titre}
																<div className="mt-2">
																	<Popup
																		trigger={
																			<a className="">
																				{" "}
																				Modifier{" "}
																			</a>
																		}
																		position="bottom center"
																	>
																		<div className="form-group text-center">
																			<input
																				type="text"
																				placeholder={
																					val.titre
																				}
																				onChange={(
																					event
																				) => {
																					setNewTitre(
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
																					updateEauTitre(
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
																		val.prix
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
																				min={
																					1
																				}
																				placeholder={
																					val.prix
																				}
																				onChange={(
																					event
																				) => {
																					setNewPrix(
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
																					updateEauPrix(
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
																{
																	val.source_financement
																}
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
																			<div className="text-start">
																				<input
																					type={
																						"radio"
																					}
																					name="newsourceFinancement"
																					id="newsourceFinancement1"
																					onInput={() => {
																						setIsBudgetPropre(
																							true
																						);
																						setNewSourceFinancementId(
																							"1111afe11f6111f11fce111c"
																						);
																					}}
																					defaultChecked
																				/>
																				<label
																					for="newsourceFinancement1"
																					className="mx-2"
																				>
																					Budget
																					propre{" "}
																				</label>
																			</div>
																			<div className="text-start">
																				<input
																					type={
																						"radio"
																					}
																					name="newsourceFinancement"
																					id="newsourceFinancement2"
																					onInput={() => {
																						setIsBudgetPropre(
																							false
																						);
																						setNewSourceFinancementId(
																							""
																						);
																					}}
																				/>
																				<label
																					for="newsourceFinancement2"
																					className="mx-2"
																				>
																					Revenus
																					d'une
																					vague
																				</label>
																			</div>
																			<select
																				className={`${
																					isBudgetPropre ==
																					true
																						? "form-control"
																						: "d-none"
																				}`}
																				required
																				onChange={(
																					event
																				) => {
																					setNewSourceFinancementId(
																						event
																							.target
																							.value
																					);
																				}}
																				placeholder="D'où viens l'argent utilisé pour cet achat ?"
																				title="D'où viens l'argent utilisé pour cet achat ?"
																			>
																				<option
																					value={
																						"1111afe11f6111f11fce111c"
																					}
																				>
																					Espèce
																				</option>
																				<option
																					value={
																						"1111afe11f6111f11fce112c"
																					}
																				>
																					Virement
																				</option>
																				<option
																					value={
																						"1111afe11f6111f11fce113c"
																					}
																				>
																					Mobile
																				</option>
																			</select>
																			<select
																				className={`${
																					isBudgetPropre ==
																					false
																						? "form-control"
																						: "d-none"
																				}`}
																				required
																				onChange={(
																					event
																				) => {
																					setNewSourceFinancementId(
																						event
																							.target
																							.value
																					);
																				}}
																				placeholder="D'où viens l'argent utilisé pour cette dépense ?"
																				title="D'où viens l'argent utilisé pour cette dépense ?"
																			>
																				{profitsList.map(
																					(
																						profits
																					) => {
																						if (
																							profits.montant -
																								val.prix >
																								0 &&
																							vagueId !=
																								profits.vagueId
																						) {
																							return (
																								<option
																									value={
																										profits._id
																									}
																									className="font-weight-bold text-success"
																								>
																									{
																										profits.titre
																									}{" "}
																									(
																									{Math.round(
																										profits.montant
																									)}{" "}
																									XAF)
																								</option>
																							);
																						}
																					}
																				)}
																				<option
																					value={
																						""
																					}
																					className={`text-danger`}
																				>
																					Aucun
																				</option>
																			</select>

																			<button
																				className="btn btn-outline-success mt-2 btn-fw"
																				onClick={() => {
																					updateSourceFinancement(
																						val._id,
																						val.prix
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
																		val.created_at
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
																					deleteEau(
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
		</div>
	);
}

export default PageEau;

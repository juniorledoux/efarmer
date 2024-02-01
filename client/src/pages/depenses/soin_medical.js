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

function PageSoin_medical() {
	const { vagueId } = useParams();
	const [soins_medicaux, setSoinsMedicaux] = useState({});
	const [fournisseursFromDb, setFournisseursFromDb] = useState(
		JSON.parse(LocalStorage.getItem("fournisseursFromDb"))
			? JSON.parse(LocalStorage.getItem("fournisseursFromDb"))
			: []
	);
	const [fournisseursList, setFournisseursList] = useState([]);
	const [newTitre, setNewTitre] = useState("");
	const [newQuantite, setNewQuantite] = useState(1);
	const [newPrix, setNewPrix] = useState(0);
	const [newSourceFinancementId, setNewSourceFinancementId] = useState(
		"1111afe11f6111f11fce111c"
	);
	const [isBudgetPropre, setIsBudgetPropre] = useState(true);
	const [newFournisseur, setNewFournisseur] = useState("Non spécifié");
	const [newFournisseurId, setNewFournisseurId] = useState("");
	const [newTransport, setNewTransport] = useState(0);
	const [newFacture, setNewFacture] = useState("");
	const [soin_medicalList, setSoin_medicalList] = useState(
		JSON.parse(LocalStorage.getItem("soin_medicalList")) &&
			JSON.parse(LocalStorage.getItem("soin_medicalList")).length != 0 &&
			JSON.parse(LocalStorage.getItem("soin_medicalList"))[0].vagueId ==
				vagueId
			? JSON.parse(LocalStorage.getItem("soin_medicalList"))
			: []
	);
	const [soinsARecyclerList, setSoinsARecyclerList] = useState(
		JSON.parse(LocalStorage.getItem("soinsARecyclerList")) &&
			JSON.parse(LocalStorage.getItem("soinsARecyclerList")).length != 0
			? JSON.parse(LocalStorage.getItem("soinsARecyclerList"))
			: []
	);
	const [soinsRecycle, setSoinsRecycle] = useState({});
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
		getSoin_medical();
		getSoinsARecycler();
	}, []);
	useEffect(() => {
		getSoinsARecycler();
	}, [soin_medicalList]);

	const getSoin_medical = () => {
		if (!soin_medicalList || soin_medicalList.length == 0) setLoading(true);
		Axios.get(`/api/soin_medical/all/${vagueId}`)
			.then((response) => {
				setSoin_medicalList(response.data);
				LocalStorage.setItem(
					"soin_medicalList",
					JSON.stringify(response.data)
				);
				getVague(vagueList);
				getSoinMedicalPrix(vagueId);
				setLoading(false);
			})
			.catch(() => {
				showAlertError(error.response.data.message);
				setLoading(false);
			});
	};

	const recyclerSoins = () => {
		setLoading(true);
		Axios.post(`/api/recyclage/soins/${vagueId}`, soinsRecycle)
			.then((response) => {
				getSoinsARecycler();
				getSoin_medical();
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

	const getSoinsARecycler = () => {
		let soinsARecycler = [];
		setSoinsARecyclerList([]);
		Axios.get(`api/customers/vague`).then((res) => {
			res.data.forEach((vague) => {
				if (vague.etat == 2) {
					Axios.get(`/api/soin_medical/all/${vague._id}`).then(
						(response) => {
							response.data.forEach((soins_medical) => {
								if (
									soins_medical.qteUtilise <
									soins_medical.quantite
								) {
									soinsARecycler.push(soins_medical);
									setSoinsARecyclerList(soinsARecycler);
									LocalStorage.setItem(
										"soinsARecyclerList",
										JSON.stringify(soinsARecycler)
									);
								}
							});
						}
					);
				}
			});
		});
	};

	const autoCompleteFournisseur = (event) => {
		setNewFournisseur(event.target.value.toUpperCase());
		const filteredFournisseur = fournisseursFromDb.filter((fournisseur) =>
			fournisseur.nom
				.toUpperCase()
				.includes(event.target.value.toUpperCase())
		);
		setFournisseursList(filteredFournisseur);
		if (event.target.value.length == 0) {
			setFournisseursList([]);
		}
	};

	const updateSoin_medicalTitre = (id) => {
		setLoading(true);
		if (newTitre == "") {
			showAlertError("Le champs ne doit pas être vide");
			setLoading(false);
		} else {
			Axios.put(`/api/soin_medical/${id}`, {
				titre: newTitre,
				_id: id,
			})
				.then((response) => {
					getSoin_medical();
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

	const updateSoin_medicalQte = (id) => {
		setLoading(true);
		if (newQuantite == "") {
			showAlertError("Le champs ne doit pas être vide");
			setLoading(false);
		} else {
			Axios.put(`/api/soin_medical/${id}`, {
				quantite: newQuantite,
				_id: id,
			})
				.then((response) => {
					getSoin_medical();
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

	const updateSoin_medicalPrix = (id) => {
		setLoading(true);
		if (newPrix == "") {
			showAlertError("Le champs ne doit pas être vide");
			setLoading(false);
		} else {
			Axios.put(`/api/soin_medical/${id}`, {
				prix: newPrix,
				_id: id,
			})
				.then((response) => {
					getSoin_medical();
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

	const updateSourceFinancement = (id, prix, transport) => {
		setLoading(true);
		if (newSourceFinancementId == "") {
			showAlertError("Le champs ne doit pas être vide");
			setLoading(false);
		} else {
			Axios.put(`/api/soin_medical/${id}`, {
				prix: prix,
				transport: transport,
				source_financementId: newSourceFinancementId,
				_id: id,
			})
				.then((response) => {
					getSoin_medical();
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

	const updateSoin_medicalFourn = (id) => {
		setLoading(true);
		if (newFournisseur == "") {
			showAlertError("Le champs ne doit pas être vide");
			setLoading(false);
		} else {
			Axios.post(`/api/fournisseur/check`, {
				fournisseur: newFournisseur,
				type: "Médicaments",
			}).then(() => {
				Axios.get(`/api/fournisseur/${newFournisseur}`).then(
					(response) => {
						setNewFournisseurId(response.data._id);
					}
				);
			});
			Axios.put(`/api/soin_medical/${id}`, {
				fournisseur: newFournisseur,
				fournisseurId: newFournisseurId,
				_id: id,
			})
				.then((response) => {
					getSoin_medical();
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

	const updateSoin_medicalTrans = (id) => {
		setLoading(true);
		if (newTransport == "") {
			showAlertError("Le champs ne doit pas être vide");
			setLoading(false);
		} else {
			Axios.put(`/api/soin_medical/${id}`, {
				transport: newTransport,
				_id: id,
			})
				.then((response) => {
					getSoin_medical();
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
		//axios.post("/api/soin_medical", formData);

		if (selectedFile == null) {
			showAlertError("Le champs ne doit pas être vide");
			setLoading(false);
		} else {
			Axios.put(`/api/soin_medical/${id}`, formData, {
				facture: selectedFile.name,
				_id: id,
			})
				.then((response) => {
					getSoin_medical();
					showAlertSuccess(response.data.message);
					setLoading(false);
				})
				.catch((error) => {
					showAlertError(error.response.data.message);
					setLoading(false);
				});
		}
	};

	const deleteSoin_medical = (id) => {
		setLoading(true);
		Axios.delete(`/api/soin_medical/${id}`)
			.then((response) => {
				getSoin_medical();
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

	const getSoinMedicalPrix = (vagueId) => {
		Axios.get(`api/cout/soin_medical/${vagueId}`).then((res) => {
			if (res.status === 200) {
				setSoinsMedicaux(res.data);
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
		let budget_soins_medicaux =
			vague.budget_soins_medicaux == 0 ? 1 : vague.budget_soins_medicaux;
		progressbar =
			((soins_medicaux.prix + soins_medicaux.transport) * 100) /
			budget_soins_medicaux;
		return progressbar;
	};

	return (
		<div>
			<NavBar
				VAGUEID={vagueId}
				vagueList={vagueList}
				funtionToUpdate={getSoin_medical}
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
								Médicaments
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
																	soins_medicaux.prix +
																	soins_medicaux.transport
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
																	vague.budget_soins_medicaux
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
											<button
												className={`btn bg-gradient-info mx-2 ${
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
											<button
												className={`btn bg-gradient-succes mx-2 ${
													vague.etat == 2
														? "d-none"
														: ""
												}`}
												data-bs-target="#recyclerSoins"
												data-bs-toggle="modal"
												data-bs-dismiss="modal"
												title="Réutiliser les aliments restants des vagues terminées"
											>
												<i class="tim-icons icon-refresh-02 text-white font-weight-bold"></i>
											</button>
											<div
												id="recyclerSoins"
												class="modal fade text-dark"
												aria-hidden="true"
												aria-labelledby="recyclerSoinsLabel"
												tabindex="-1"
												data-bs-backdrop="static"
												data-bs-keyboard="false"
											>
												<div
													class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable"
													style={{
														margin: "auto",
														marginTop: "30px",
													}}
												>
													<form
														onSubmit={(event) => {
															event.preventDefault();
															recyclerSoins();
														}}
														class="modal-content"
													>
														<div class="modal-header">
															<h5
																class="modal-title"
																id="recyclerSoinsLabel"
															>
																Réutiliser les
																médicaments
																restants des
																vagues
																terminées.
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
																			Sélectionner{" "}
																		</th>
																		<th className="text-center">
																			{" "}
																			Titre{" "}
																		</th>
																		<th className="text-center">
																			{" "}
																			Quantité
																			en
																			stock{" "}
																		</th>
																		<th className="text-center">
																			{" "}
																			Valeur
																			totale{" "}
																		</th>

																		<th className="text-center">
																			{" "}
																			Date
																		</th>
																	</tr>
																</thead>
																<tbody>
																	{soinsARecyclerList.length ==
																	0 ? (
																		<tr className="text-center text-danger m-auto">
																			Vide
																		</tr>
																	) : (
																		""
																	)}

																	{soinsARecyclerList.map(
																		(
																			soinsARecycler,
																			index
																		) => (
																			<tr
																				key={
																					index
																				}
																			>
																				<td className="text-center">
																					<div
																						className="form-check text-center"
																						title="Sélectionner l'aliment"
																					>
																						<input
																							className="form-check-input p-2"
																							type="radio"
																							name="checkAliment"
																							required
																							value="check"
																							onInput={() => {
																								setSoinsRecycle(
																									soinsARecycler
																								);
																							}}
																						/>
																					</div>
																				</td>
																				<td className="text-center">
																					{
																						soinsARecycler.titre
																					}
																				</td>
																				<td className="text-center">
																					{" "}
																					<NumberFormat
																						value={
																							soinsARecycler.quantite -
																							soinsARecycler.qteUtilise
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
																				</td>
																				<td className="text-center">
																					{" "}
																					<NumberFormat
																						value={
																							((soinsARecycler.prix +
																								soinsARecycler.transport) /
																								soinsARecycler.quantite) *
																							(soinsARecycler.quantite -
																								soinsARecycler.qteUtilise)
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
																							soinsARecycler.created_at
																						)
																					).format(
																						"DD/MM/YYYY"
																					)}
																				</td>
																			</tr>
																		)
																	)}
																</tbody>
															</table>
														</div>
														<div class="modal-footer">
															<button
																className="btn btn-outline-success m-auto btn-fw"
																type="submit"
															>
																{" "}
																<i class="tim-icons icon-refresh-02 px-2 font-weight-bold"></i>
																Réutiliser
															</button>
														</div>
													</form>
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
															Facture{" "}
														</th>
														<th className="text-center">
															{" "}
															Titre{" "}
														</th>
														<th className="text-center">
															{" "}
															Quantité achetée{" "}
														</th>
														<th className="text-center">
															{" "}
															Prix total
														</th>
														<th className="text-center">
															{" "}
															Fournisseur{" "}
														</th>
														<th className="text-center">
															{" "}
															Transport
														</th>
														<th className="text-center">
															{" "}
															Quantité utilisée
														</th>
														<th className="text-center">
															{" "}
															Quantité restante
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
													{soin_medicalList.length ==
													0 ? (
														<tr className="text-center text-danger m-auto">
															Vide
														</tr>
													) : (
														""
													)}
													{soin_medicalList.map(
														(val) => (
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
																	{val.recyclage ==
																	"oui" ? (
																		<i
																			class="tim-icons icon-refresh-02 text-success px-2 font-weight-bold"
																			title="Ce médicament est une réutilisation"
																		></i>
																	) : (
																		""
																	)}
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
																						updateSoin_medicalTitre(
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
																			val.quantite
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
																						val.quantite
																					}
																					onChange={(
																						event
																					) => {
																						setNewQuantite(
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
																						updateSoin_medicalQte(
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
																		suffix={
																			" XAF"
																		}
																	/>{" "}
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
																						updateSoin_medicalPrix(
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
																	{val.fournisseur
																		? val.fournisseur
																		: "Aucun fournisseur"}{" "}
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
																				<label>
																					Nouveau
																					fournisseur
																					:
																				</label>
																				<input
																					type="text"
																					value={
																						newFournisseur
																					}
																					placeholder={val.fournisseur.toUpperCase()}
																					onChange={(
																						event
																					) => {
																						autoCompleteFournisseur(
																							event
																						);
																					}}
																					className="form-control"
																				/>
																				{fournisseursList.length !=
																				0 ? (
																					<ul
																						className="list-unstyled px-3 bg-gradient-secondary w-100"
																						style={{
																							height: "100px",
																							overflow:
																								"auto",
																						}}
																					>
																						{fournisseursList.map(
																							(
																								fournisseur
																							) => {
																								return (
																									<li
																										key={
																											fournisseur._id
																										}
																										onClick={(
																											e
																										) => {
																											setNewFournisseur(
																												fournisseur.nom
																											);
																											setFournisseursList(
																												[]
																											);
																										}}
																									>
																										{
																											fournisseur.nom
																										}{" "}
																										(
																										{
																											fournisseur.score
																										}

																										)
																									</li>
																								);
																							}
																						)}
																					</ul>
																				) : (
																					""
																				)}
																				<button
																					className="btn btn-outline-success mt-2 btn-fw"
																					onClick={() => {
																						updateSoin_medicalFourn(
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
																			val.transport
																		}
																		displayType={
																			"text"
																		}
																		thousandSeparator={
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
																						val.transport
																					}
																					onChange={(
																						event
																					) => {
																						setNewTransport(
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
																						updateSoin_medicalTrans(
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
																	/>{" "}
																	<p className="mt-1">
																		<Link
																			to={`/pages/vagues/${vagueId}/depenses/soin-medical/${val._id}/consommations`}
																		>
																			Voir
																			les
																			consommations
																		</Link>
																	</p>
																</td>
																<td className="text-center">
																	<NumberFormat
																		value={
																			val.qteUtilise
																				? val.quantite -
																				  val.qteUtilise
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
																	/>{" "}
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
																									(val.prix +
																										val.transport) >
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
																							val.prix,
																							val.transport
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
																						deleteSoin_medical(
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

export default PageSoin_medical;

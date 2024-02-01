import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Link,
	Navigate,
} from "react-router-dom";
import LocalStorage from "localStorage";
import moment from "moment";
import NumberFormat from "react-number-format";
import Axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";
import BarLoader from "react-spinners/BarLoader";
import {
	Provider as AlertProvider,
	useAlert,
	positions,
	types,
	transitions,
} from "react-alert";

import NavBar from "../../components/utils/navBar";
import people from "../../components/assets/images/dashboard/people.svg";
import RapportVague from "../../components/rapports/rapportVague";
import BenefSurPrix from "../../components/results/simulations/getBenefSurPrix";

function VagueShow() {
	const { vagueId } = useParams();
	const [currentVague, setCurrentVague] = useState({});
	const [vagueList, setVagueList] = useState(
		JSON.parse(LocalStorage.getItem("vagueList"))
			? JSON.parse(LocalStorage.getItem("vagueList"))
			: []
	);

	const [coutProduction, setCoutProduction] = useState(
		JSON.parse(LocalStorage.getItem("coutProduction"))
			? JSON.parse(LocalStorage.getItem("coutProduction"))
			: 0
	);
	const [valeurSurCoutProduction, setValeurSUrCoutProduction] = useState(
		JSON.parse(LocalStorage.getItem("valeurSurCoutProduction"))
			? JSON.parse(LocalStorage.getItem("valeurSurCoutProduction"))
			: 0
	);
	const [dateSimulation, setDateSimulation] = useState("");
	const [valeurSurDate, setValeurSurDate] = useState("");
	const [valeurSurBenef, setValeurSurBenef] = useState("");
	const [margeBenef, setMargeBenef] = useState("");

	//les data pour les mesure de poids
	const [dateMesurePoids, setDateMesurePoids] = useState("");
	const [poidsMoyen, setPoidsMoyen] = useState();

	const [newTitre, setNewTitre] = useState("");
	const [newQteAnimaux, setNewQteAnimaux] = useState(0);
	const [newPrixAnimaux, setNewPrixAnimaux] = useState(0);
	const [newFournisseur, setNewFournisseur] = useState("");
	const [newFournisseurId, setNewFournisseurId] = useState("");
	const [newTransport, setNewTransport] = useState(0);

	const [benef_attendu, setBenef_attendu] = useState(0);

	const [fournisseursFromDb, setFournisseursFromDb] = useState(
		JSON.parse(LocalStorage.getItem("fournisseursFromDb"))
			? JSON.parse(LocalStorage.getItem("fournisseursFromDb"))
			: []
	);
	const [fournisseursList, setFournisseursList] = useState([]);

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

	const addPoids = (vagueId) => {
		if (dateMesurePoids == "") {
			return showAlertError("Entrez la date de la mesure");
		}
		setLoading(true);
		Axios.post("/api/poids", {
			vagueId: vagueId,
			poids: poidsMoyen,
			date_mesure: new Date(dateMesurePoids).toDateString(),
		})
			.then((response) => {
				if (response.status === 201) {
					showAlertSuccess(response.data.message);
					getVagues();
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

	const loadDataForm = (currentVague) => {
		setNewTitre(currentVague.titre);
		setNewQteAnimaux(currentVague.qte_animaux);
		setNewPrixAnimaux(currentVague.prix_animaux);
		setNewFournisseur(currentVague.fournisseur);
		setNewFournisseurId(currentVague.fournisseurId);
		setNewTransport(currentVague.transport);
	};

	const updateVague = (id) => {
		setLoading(true);
		Axios.post(`/api/fournisseur/check`, {
			fournisseur: newFournisseur,
			type: "Sujets",
		}).then(() => {
			Axios.get(`/api/fournisseur/${newFournisseur}`).then((response) => {
				setNewFournisseurId(response.data._id);
			});
		});
		Axios.put(`/api/customers/vague/${id}`, {
			titre: newTitre,
			qte_animaux: newQteAnimaux,
			prix_animaux: newPrixAnimaux,
			fournisseur: newFournisseur,
			fournisseurId: newFournisseurId,
			transport: newTransport,
			_id: id,
		})
			.then((response) => {
				if (response.status === 201) {
					getVagues();
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

	useEffect(() => {
		getVagues();
	}, []);

	const getVagues = () => {
		Axios.get(`/api/customers/vague`)
			.then((res) => {
				LocalStorage.setItem("vagueList", JSON.stringify(res.data));
				setVagueList(res.data);
				getCurrentVague(res.data);
			})
			.catch(() => {
				showAlertError(error.response.data.message);
			});
	};

	useEffect(() => {
		getCurrentVague(vagueList);
		getCoutProduction(vagueId);
		getValeurSurCoutProduction(vagueId);
	}, [vagueList]);

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

	const getCurrentVague = (vagueList) => {
		let v = {};
		vagueList.forEach((vague) => {
			if (vague._id == vagueId) {
				v = vague;
			}
		});
		setCurrentVague(v);
		loadDataForm(v);
	};

	const getCoutProduction = (vagueId) => {
		Axios.get(`api/results/depenses_actu/${vagueId}`).then((res) => {
			if (res.status === 200) {
				LocalStorage.setItem(
					"coutProduction",
					JSON.stringify(res.data.depenseActuelle)
				);
				setCoutProduction(res.data.depenseActuelle);
			}
		});
	};

	const getValeurSurCoutProduction = (vagueId) => {
		Axios.get(`api/results/valeur_actu/${vagueId}`).then((res) => {
			if (res.status === 200) {
				LocalStorage.setItem(
					"valeurSurCoutProduction",
					JSON.stringify(res.data.valeurActuelle)
				);
				setValeurSUrCoutProduction(res.data.valeurActuelle);
			}
		});
	};

	const getValeurSurBenef = (vagueId) => {
		setLoading(true);
		Axios.post(`api/results/valeur_sur_benef/${vagueId}`, {
			benef_attendu: benef_attendu,
		})
			.then((res) => {
				setLoading(false);
				if (res.status === 200) {
					setValeurSurBenef(res.data.valeurSurBenef);
					setMargeBenef(res.data.margeBenef);
					getVagues();
				}
			})
			.catch((error) => {
				showAlertError(error.response.data.message);
				setLoading(false);
			});
	};

	const getValeurSurDate = (vagueId) => {
		if (dateSimulation == "") {
			return showAlertError("Veuillez sélectionner une date");
		}
		setLoading(true);
		Axios.post(`api/results/valeur_sur_date/${vagueId}`, {
			date: new Date(dateSimulation).toDateString(),
		})
			.then((res) => {
				setLoading(false);
				if (res.status === 200) {
					setValeurSurDate(res.data.valeurSurDate);
					getVagues();
				}
			})
			.catch((error) => {
				showAlertError(error.response.data.message);
				setLoading(false);
			});
	};
	// const getCurrentVague = () => {
	// 	if (
	// 		JSON.parse(LocalStorage.getItem("currentVague")) &&
	// 		JSON.parse(LocalStorage.getItem("currentVague"))._id == vagueId
	// 	) {
	// 		setCurrentVague(JSON.parse(LocalStorage.getItem("currentVague")));
	// 	}
	// 	Axios.get(`/api/customers/vague/${vagueId}`)
	// 		.then((res) => {
	// 			// LocalStorage.setItem("currentVague", JSON.stringify(res.data));
	// 			setCurrentVague(res.data);
	// 		})
	// 		.catch(() => {
	// 			showAlertError(error.response.data.message);
	// 		});
	// };

	const getRapportSimulationBenef = () => {
		if (valeurSurBenef < 0) {
			return (
				<p>
					Pour réaliser ce bénéfice vous devez vendre à:{" "}
					<strong className="text-danger">
						{
							<NumberFormat
								value={valeurSurBenef}
								displayType={"text"}
								thousandSeparator={true}
								decimalScale={true}
								suffix={" XAF/Sujet."}
							/>
						}
					</strong>{" "}
					Ce qui fait une marge bénéficiaire de:{" "}
					<NumberFormat
						value={margeBenef}
						displayType={"text"}
						thousandSeparator={true}
						decimalScale={true}
						suffix={"%"}
					/>
				</p>
			);
		} else if (valeurSurBenef > 0) {
			return (
				<p>
					Pour réaliser ce bénéfice vous devez vendre à:{" "}
					<strong className="text-success">
						{
							<NumberFormat
								value={valeurSurBenef}
								displayType={"text"}
								thousandSeparator={true}
								decimalScale={true}
								suffix={" XAF/Sujet."}
							/>
						}
					</strong>{" "}
					{/* Ce qui fait une marge bénéficiaire de:{" "}
					<NumberFormat
						value={margeBenef}
						displayType={"text"}
						thousandSeparator={true}
						decimalScale={true}
						suffix={"%"}
					/> */}
				</p>
			);
		} else if (valeurSurBenef === 0) {
			return (
				<p>
					Pour réaliser ce bénéfice,{" "}
					<strong className="text-warning">
						autant partager les sujets.
					</strong>
				</p>
			);
		} else return "";
	};

	return (
		<div>
			<NavBar
				VAGUEID={vagueId}
				vagueList={vagueList}
				setVagueList={setVagueList}
				funtionToUpdate={getVagues}
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
								to={`/pages/vagues`}
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
								Détails De La Vague
							</h2>
							<div
								style={{
									marginTop: "40px",
									marginBottom: "45px",
								}}
							>
								<div className="row">
									<div className="col-md-12">
										<div className="row">
											<div className="col-12 col-xl-8 mb-4 mb-xl-0">
												<h3 className="font-weight-bold">
													{currentVague.titre}
												</h3>
												<h6 className="font-weight-normal mb-0">
													Cette vague{" "}
													<span className="text-primary">
														{currentVague.date_arrive &&
														currentVague.etat > 0
															? currentVague.etat ==
															  1
																? " arrive en maturité le: " +
																  moment(
																		new Date(
																			Date.parse(
																				currentVague.date_arrive
																			) +
																				86400 *
																					1000 *
																					45
																		)
																  ).format(
																		"DD/MM/YYYY"
																  )
																: " a été stoppée le: " +
																  moment(
																		new Date(
																			Date.parse(
																				currentVague.stoppe_le
																			)
																		)
																  ).format(
																		"DD/MM/YYYY"
																  )
															: "Non Démarrée"}
													</span>
												</h6>
											</div>
											<div className="col-12 col-xl-4">
												<div className="justify-content-between d-flex">
													<div className="flex-md-grow-1 flex-xl-grow-0">
														{/* start button*/}

														<RapportVague
															vagueId={vagueId}
															vagueList={
																vagueList
															}
															setVagueList={
																setVagueList
															}
														/>
														{currentVague.etat ==
														2 ? (
															""
														) : (
															<a
																className={`fs-3 p-2 mx-1`}
																data-bs-target="#ModifierVague"
																data-bs-toggle="modal"
																data-bs-dismiss="modal"
															>
																<i class="tim-icons icon-pencil text-primary mx-2"></i>
															</a>
														)}

														<div
															id="ModifierVague"
															class="modal fade text-dark"
															aria-hidden="true"
															aria-labelledby="ModifierVagueLabel"
															tabindex="-1"
															data-bs-keyboard="false"
														>
															<div
																class="modal-dialog modal-dialog-centered modal-md modal-dialog-scrollable"
																style={{
																	margin: "auto",
																	marginTop:
																		"30px",
																}}
															>
																<form
																	onSubmit={(
																		event
																	) => {
																		event.preventDefault();
																		updateVague(
																			vagueId
																		);
																	}}
																	class="modal-content"
																>
																	<div class="modal-header">
																		<h5
																			class="modal-title"
																			id="ModifierVagueLabel"
																		>
																			Mise
																			à
																			jour
																			d'une
																			vague
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
																				Titre{" "}
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
																				type="text"
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
																				value={
																					newTitre
																				}
																				placeholder={
																					"Modifier le titre de votre vague"
																				}
																				title="Modifier le titre de votre vague"
																			/>
																		</div>
																		<div className="form-group">
																			<label>
																				Nombre
																				d'animaux{" "}
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
																				min={
																					1
																				}
																				onChange={(
																					event
																				) => {
																					setNewQteAnimaux(
																						event
																							.target
																							.value
																					);
																				}}
																				className="form-control"
																				value={
																					newQteAnimaux
																				}
																				placeholder="Modifier le nombre d'animaux acheté"
																				title="Modifier le nombre d'animaux acheté"
																			/>
																		</div>
																		<div className="form-group">
																			<label>
																				Prix
																				total
																				des
																				animaux{" "}
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
																				min={
																					1
																				}
																				onChange={(
																					event
																				) => {
																					setNewPrixAnimaux(
																						event
																							.target
																							.value
																					);
																				}}
																				className="form-control"
																				value={
																					newPrixAnimaux
																				}
																				placeholder="Modifier le prix total des animaux"
																				title="Modifier le prix total des animaux"
																			/>
																		</div>
																		<div className="form-group">
																			<label>
																				Prix
																				du
																				transport{" "}
																			</label>
																			<input
																				required
																				type="number"
																				min={
																					0
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
																				value={
																					newTransport
																				}
																				placeholder="Modifier le prix du transport"
																				title="Modifier le prix du transport"
																			/>
																		</div>
																		<div className="form-group">
																			<label>
																				Fournisseur
																			</label>
																			<input
																				type="text"
																				onChange={(
																					event
																				) => {
																					autoCompleteFournisseur(
																						event
																					);
																				}}
																				className="form-control"
																				value={
																					newFournisseur
																				}
																				placeholder="Modifier le nom du fournisseur"
																				title="Modifier le nom du fournisseur"
																			/>
																			{fournisseursList.length !=
																			0 ? (
																				<ul
																					className="list-unstyled px-3 position-absolute bg-gradient-secondary"
																					style={{
																						height: "130px",
																						width: "90%",
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
																		</div>
																	</div>
																	<div class="modal-footer">
																		<button
																			className="btn btn-outline-success m-auto btn-fw"
																			type="submit"
																		>
																			{" "}
																			Mettre
																			à
																			jour
																		</button>
																	</div>
																</form>
															</div>
														</div>
													</div>
													<div className="dropdown flex-md-grow-1 flex-xl-grow-0">
														<Link
															to={`/pages/vagues/${vagueId}/profits`}
															className="btn btn-sm btn-light bg-white dropdown-toggle text-dark"
															type="button"
															id="dropdownMenuDate2"
															data-toggle="dropdown"
															aria-haspopup="true"
															aria-expanded="true"
														>
															<i class="tim-icons icon-chart-bar-32 text-danger font-weight-bold mx-2 pb-1"></i>
															<span className="align-items-center fs-6 text-primary font-weight-bold">
																{currentVague.age_sujet ==
																	0 ||
																currentVague.age_sujet ==
																	1 ? (
																	<NumberFormat
																		value={
																			currentVague.age_sujet
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
																			" Jour"
																		}
																	/>
																) : (
																	<NumberFormat
																		value={
																			currentVague.age_sujet
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
																)}
															</span>
														</Link>
													</div>
												</div>
												{currentVague.etat == 1 ? (
													<p class="card-text">
														<BarLoader
															color={"#E91E63"}
															loading={true}
															size={135}
															className="float-end w-100 my-1 rounded"
															aria-label="Loading Spinner"
															data-testid="loader"
														/>
													</p>
												) : (
													""
												)}
											</div>
										</div>
									</div>
								</div>
								<div class="row my-3">
									<div className="col-lg-12">
										<div className="row">
											<div className="col-lg-4"></div>
											<div className="col-lg-8">
												<div class="card-title font-weight-bold text-end px-2">
													{valeurSurCoutProduction >
													0 ? (
														"Seuil de rentabilité:"
													) : (
														<span className="text-success">
															{" "}
															Bénéfice de:
															<NumberFormat
																value={
																	currentVague.NbreSujet_vendu *
																		currentVague.prixMoyenVente_sujet -
																	coutProduction
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
																suffix={" XAF."}
															/>
															<br />
														</span>
													)}
													{valeurSurCoutProduction >
													0 ? (
														<span className="text-primary fs-5">
															{" "}
															<NumberFormat
																value={
																	valeurSurCoutProduction
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
														</span>
													) : (
														<span className="text-warning fs-6">
															{" "}
															Vous pouvez vendre à
															n'importe quel prix
															!
														</span>
													)}
												</div>
											</div>
										</div>
									</div>
								</div>
								<div className="row align-items-center">
									<div className="col-md-6 grid-margin stretch-card ">
										<div className="card tale-bg h-100 shadow-lg rounded">
											<img
												src={people}
												alt="people"
												className="rounded"
											/>
											<div className="weather-info">
												<div className="col-lg-12 font-weight-bold">
													{currentVague.date_arrive
														? "Démarrée le: " +
														  moment(
																new Date(
																	Date.parse(
																		currentVague.date_arrive
																	)
																)
														  ).format("DD/MM/YYYY")
														: ""}
												</div>
											</div>

											<div class="card-body ">
												<h5 class="card-title">
													{
														<NumberFormat
															value={
																currentVague.prix_animaux
															}
															displayType={"text"}
															thousandSeparator={
																true
															}
															decimalScale={true}
															suffix={
																" XAF : achat des sujets"
															}
														/>
													}
												</h5>
												<p class="card-text">
													{
														<NumberFormat
															value={
																currentVague.poidsMoyen_sujet
															}
															displayType={"text"}
															thousandSeparator={
																true
															}
															decimalScale={true}
															suffix={
																" Kg/sujet (en moyenne)"
															}
														/>
													}
													{currentVague.etat == 2 ? (
														""
													) : (
														<a
															className="fs-5 p-2 "
															data-bs-target="#ajouterMesurePoids"
															data-bs-toggle="modal"
															data-bs-dismiss="modal"
														>
															<i class="tim-icons icon-pencil text-primary mb-2 mx-2"></i>
														</a>
													)}
													<div
														id="ajouterMesurePoids"
														class="modal fade text-dark"
														aria-hidden="true"
														aria-labelledby="ajouterMesurePoidsLabel"
														tabindex="-1"
														data-bs-keyboard="false"
													>
														<div
															class="modal-dialog modal-dialog-centered modal-md modal-dialog-scrollable"
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
																		id="ajouterMesurePoidsLabel"
																	>
																		Ajout
																		d'une
																		mésure
																		de
																		poids.
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
																			Poids
																			moyen
																			(en
																			Kg){" "}
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
																			step=".01"
																			onChange={(
																				event
																			) => {
																				setPoidsMoyen(
																					event
																						.target
																						.value
																				);
																			}}
																			className="form-control"
																			placeholder="Entrez le poids moyen des sujets en Kg"
																			title="Entrez le poids moyen des sujets en Kg"
																		/>
																	</div>
																	<div className="form-group">
																		<label>
																			Date
																			de
																			mésure{" "}
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
																				setDateMesurePoids(
																					event
																						.target
																						.value
																				);
																			}}
																			className="form-control"
																			placeholder="Entez la date réelle de mesure du poids des sujets"
																			title="Entez la date réelle de mesure du poids des sujets"
																		/>
																	</div>
																</div>
																<div class="modal-footer">
																	<button
																		className="btn btn-outline-primary m-auto btn-fw"
																		onClick={() => {
																			addPoids(
																				vagueId
																			);
																		}}
																	>
																		{" "}
																		Ajouter
																	</button>
																</div>
															</div>
														</div>
													</div>
												</p>
												<p className="card-text">
													Fourni par:{" "}
													<span className="font-weight-bold">
														{
															currentVague.fournisseur
														}
													</span>{" "}
													(
													<span className="text-primary">
														{" "}
														{
															<NumberFormat
																value={
																	currentVague.transport
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
																	" XAF de transport"
																}
															/>
														}{" "}
													</span>
													)
												</p>
											</div>
										</div>
									</div>
									<div className="col-md-6 grid-margin transparent">
										<div class="row">
											<div class="col-sm-6 mb-2">
												<Link
													to={`/pages/vagues/${currentVague._id}/stock`}
													class="card card-link-hover rounded shadow-lg text-decoration-none h-100 mb-3"
													style={{
														maxWidth: "20rem",
														color: "red",
														background: "#0b7fb455",
													}}
												>
													<div class="card-header text-center font-weight-bold">
														STOCKS
													</div>
													<div class="card-body text-primary">
														<h5 class="card-title text-center fs-3 text-primary">
															{currentVague.enStock ==
																0 ||
															currentVague.enStock ==
																1 ? (
																<NumberFormat
																	value={
																		currentVague.enStock
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
															) : (
																<NumberFormat
																	value={
																		currentVague.enStock
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
															)}
														</h5>
														<p className="card-text fs-5 text-center">
															{currentVague.enStock ==
																0 ||
															currentVague.enStock ==
																1
																? "Sujet en stock"
																: "Sujets en stock"}
														</p>
													</div>
												</Link>
											</div>
											<div class="col-sm-6 mb-2">
												<Link
													to={`/pages/vagues/${currentVague._id}/depenses`}
													class="card card-link-hover rounded shadow-lg text-decoration-none h-100 mb-3"
													style={{
														maxWidth: "20rem",
														background: "#fffb0044",
													}}
												>
													<div class="card-header text-center font-weight-bold">
														DEPENSES
													</div>
													<div class="card-body text-primary">
														<h5 class="card-title text-center fs-3 text-primary">
															<NumberFormat
																value={
																	coutProduction
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
														</h5>
														<p className="card-text fs-5 text-center">
															XAF de dépense
														</p>
													</div>
												</Link>
											</div>
										</div>
										<div class="row">
											<div class="col-sm-6 mt-2">
												<Link
													to={`/pages/vagues/${currentVague._id}/pertes`}
													class="card card-link-hover rounded shadow-lg text-decoration-none h-100 mb-3"
													style={{
														maxWidth: "20rem",
														background: "#ff000d4d",
													}}
												>
													<div class="card-header text-center font-weight-bold">
														PERTES
													</div>
													<div class="card-body text-primary">
														<h5 class="card-title text-center fs-3 text-primary">
															{currentVague.animaux_perdu ==
																0 ||
															currentVague.animaux_perdu ==
																1 ? (
																<NumberFormat
																	value={
																		currentVague.animaux_perdu
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
															) : (
																<NumberFormat
																	value={
																		currentVague.animaux_perdu
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
															)}
														</h5>
														<p className="card-text fs-5 text-center">
															{currentVague.animaux_perdu ==
																0 ||
															currentVague.animaux_perdu ==
																1
																? "Sujet perdu"
																: "Sujets perdus"}
														</p>
														<p className="card-text text-center">
															<NumberFormat
																value={
																	(currentVague.animaux_perdu *
																		100) /
																	currentVague.qte_animaux
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
																suffix={
																	"% du stock initial"
																}
															/>
														</p>
													</div>
												</Link>
											</div>
											<div class="col-sm-6 mt-2">
												<Link
													to={`/pages/vagues/${currentVague._id}/ventes`}
													class="card card-link-hover rounded shadow-lg text-decoration-none h-100 mb-3"
													style={{
														maxWidth: "20rem",
														color: "red",
														background: "#2e8a0a40",
													}}
												>
													<div class="card-header text-center font-weight-bold">
														VENTES
													</div>
													<div class="card-body text-primary">
														<h5 class="card-title text-center fs-3 text-primary">
															{currentVague.NbreSujet_vendu ==
																0 ||
															currentVague.NbreSujet_vendu ==
																1 ? (
																<NumberFormat
																	value={
																		currentVague.NbreSujet_vendu *
																		currentVague.prixMoyenVente_sujet
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
															) : (
																<NumberFormat
																	value={
																		currentVague.NbreSujet_vendu *
																		currentVague.prixMoyenVente_sujet
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
															)}
														</h5>
														<p className="card-text fs-5 text-center">
															XAF de vente
														</p>
													</div>
												</Link>
											</div>
										</div>
									</div>
								</div>

								<div class="row">
									<div className="col-lg-12 m-auto">
										<div
											className="card rounded shadow-lg"
											style={{
												color: "red",
												background: "#4b49ac30",
											}}
										>
											<div class="card-header text-center font-weight-bold">
												SIMULATIONS
											</div>
											<div class="card-body text-dark font-weight-bold">
												<div className="row m-0">
													<div className="col-4 text-center">
														<BenefSurPrix
															setLoading={
																setLoading
															}
															VAGUEID={vagueId}
														/>
													</div>
													<div className="col-4 text-center">
														<span className="">
															<a
																className="text-dark text-decoration-underline font-weight-bold"
																data-bs-target="#simulationBenef"
																data-bs-toggle="modal"
																data-bs-dismiss="modal"
															>
																{" "}
																Profit{" "}
															</a>
															<div
																id="simulationBenef"
																class="modal fade text-dark"
																aria-hidden="true"
																aria-labelledby="simulationBenefLabel"
																tabindex="-1"
																data-bs-keyboard="false"
															>
																<div
																	class="modal-dialog modal-dialog-centered modal-md modal-dialog-scrollable"
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
																				id="simulationBenefLabel"
																			>
																				Simulation
																				du
																				prix
																				de
																				vente
																				avec
																				un
																				bénéfice
																				attendu.
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
																					Entrer
																					le
																					bénéfice
																					souhaité.
																				</label>
																				<input
																					type="number"
																					title="Entrer
																					le bénéfice
																					souhaité."
																					placeholder={
																						benef_attendu
																					}
																					onChange={(
																						event
																					) => {
																						setBenef_attendu(
																							event
																								.target
																								.value
																						);
																					}}
																					className="form-control"
																				/>
																			</div>

																			<hr
																				style={{
																					border: "1.5px dotted black",
																				}}
																			/>

																			<div className="mt-2 text-start">
																				{getRapportSimulationBenef()}
																			</div>
																		</div>
																		<div class="modal-footer">
																			<button
																				className="btn btn-outline-success m-auto btn-fw"
																				onClick={() => {
																					getValeurSurBenef(
																						vagueId
																					);
																				}}
																			>
																				{" "}
																				Simuler
																			</button>
																		</div>
																	</div>
																</div>
															</div>
														</span>
													</div>
													<div className="col-4 text-center">
														<span className="">
															<a
																className="text-dark text-decoration-underline font-weight-bold"
																data-bs-target="#simulationDate"
																data-bs-toggle="modal"
																data-bs-dismiss="modal"
															>
																{" "}
																Date{" "}
															</a>
															<div
																id="simulationDate"
																class="modal fade text-dark"
																aria-hidden="true"
																aria-labelledby="simulationBenefDate"
																tabindex="-1"
																data-bs-keyboard="false"
															>
																<div
																	class="modal-dialog modal-dialog-centered modal-md modal-dialog-scrollable"
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
																				id="simulationBenefDate"
																			>
																				Valeur
																				des
																				sujtes
																				à
																				une
																				date
																				précise.
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
																					Entrer
																					une
																					date
																					pour
																					savoir
																					la
																					valeur
																					des
																					sujets.
																					<br />
																					(Date
																					du
																					jour
																					par
																					defaut)
																				</label>
																				<input
																					type="date"
																					title="Entrer une date pour savoir la valeur des sujets."
																					placeholder={
																						dateSimulation
																					}
																					value={
																						dateSimulation
																					}
																					required
																					onChange={(
																						event
																					) => {
																						setDateSimulation(
																							event
																								.target
																								.value
																						);
																					}}
																					className="form-control"
																				/>
																			</div>

																			<hr
																				style={{
																					border: "1.5px dotted black",
																				}}
																			/>

																			{valeurSurDate ? (
																				<div className="mt-2 text-start">
																					La
																					valeur
																					des
																					sujets
																					est
																					de:{" "}
																					<span className="text-primary">
																						<NumberFormat
																							value={
																								valeurSurDate
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
																					</span>{" "}
																					à
																					la
																					date
																					du{" "}
																					{moment(
																						new Date(
																							Date.parse(
																								dateSimulation
																							)
																						)
																					).format(
																						"DD/MM/YYYY"
																					)}
																				</div>
																			) : (
																				""
																			)}
																		</div>
																		<div class="modal-footer">
																			<button
																				className="btn btn-outline-success m-auto btn-fw"
																				onClick={() => {
																					getValeurSurDate(
																						vagueId
																					);
																				}}
																			>
																				{" "}
																				Simuler
																			</button>
																		</div>
																	</div>
																</div>
															</div>
														</span>
													</div>
												</div>
											</div>
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

export default VagueShow;

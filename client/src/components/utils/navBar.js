import React, { useState, useEffect } from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Link,
	Navigate,
} from "react-router-dom";
import { Button } from "react-bootstrap";
import { Offcanvas } from "react-bootstrap";
import SideBar from "./sidebar";
import LocalStorage from "localStorage";
import Axios from "axios";

import {
	DropdownMenu,
	DropdownItem,
	UncontrolledDropdown,
	DropdownToggle,
	Nav,
	Media,
} from "reactstrap";
import BarLoader from "react-spinners/BarLoader";
import ClipLoader from "react-spinners/ClipLoader";
import {
	Provider as AlertProvider,
	useAlert,
	positions,
	types,
	transitions,
} from "react-alert";

import logo from "../../components/assets/images/logo.png";
import logoMini from "../../components/assets/images/logo-mini.svg";
import face28 from "../../components/assets/images/faces/face28.jpg";

function NavBar(props) {
	const [profil, setProfil] = useState(
		JSON.parse(LocalStorage.getItem("profil"))
			? JSON.parse(LocalStorage.getItem("profil"))
			: {}
	);
	const [currentVague, setCurrentVague] = useState({});
	const [vagueList, setVagueList] = useState(props.vagueList);
	const [vagueId, setVagueId] = useState(props.VAGUEID);
	const [show, setShow] = useState(false);
	const [loading, setLoading] = useState(false);
	//new vague data
	const [titre, setTitre] = useState(
		"Vague du " + new Date().toLocaleDateString()
	);
	const [qte_animaux, setQteAnimaux] = useState(1000);
	const [prix_unitaire, setPrixUnitaire] = useState(600);
	const [fournisseur, setFournisseur] = useState("Non spécifié");
	const [fournisseurId, setFournisseurId] = useState("");
	const [etat, setEtat] = useState(0);
	const [enStock, setEnStock] = useState(1000);
	//new pertes data
	const [datePerte, setDatePerte] = useState("");
	const [nbrePerte, setNbrePerte] = useState(0);
	//new vente data
	const [dateVente, setDateVente] = useState("");
	const [nbreSujetVendu, setNbreSujetVendu] = useState(0);
	const [montantVente, setMontantVente] = useState(0);
	const [poidsTotalVente, setPoidsTotalVente] = useState(0);
	const [modePayement, setModePayement] = useState("Immédiat");
	const [montantAvance, setMontantAvance] = useState(0);
	const [modeEncaissement, setModeEncaissement] = useState("Espèces");
	const [acheteur, setAcheteur] = useState("Non spécifié");
	const [acheteurId, setAcheteurId] = useState("");
	const [telAcheteur, setTelAcheteur] = useState(0);

	const [fournisseursFromDb, setFournisseursFromDb] = useState(
		JSON.parse(LocalStorage.getItem("fournisseursFromDb"))
			? JSON.parse(LocalStorage.getItem("fournisseursFromDb"))
			: []
	);
	const [fournisseursList, setFournisseursList] = useState([]);
	const [acheteursFromDb, setAcheteurFromDb] = useState(
		JSON.parse(LocalStorage.getItem("acheteursFromDb"))
			? JSON.parse(LocalStorage.getItem("acheteursFromDb"))
			: []
	);
	const [acheteursList, setAcheteursList] = useState([]);

	const [prix, setPrix] = useState(1);
	const [sourceFinancementId, setSourceFinancementId] = useState(
		"1111afe11f6111f11fce111c"
	);
	const [titreDepense, setTitreDepense] = useState(
		"Dépense du " + new Date().toLocaleDateString()
	);
	const [typeDepenseAliment, setTypeDepenseAliment] = useState(
		"Aliment de prédémarrage"
	);
	const [quantite, setQuantite] = useState(1);
	const [transport, setTransport] = useState(0);
	const [emplacement, setEmplacement] = useState("");
	const [destination, setDestination] = useState("");
	const [transporteur, setTransporteur] = useState("");
	const [poidsUnitaire, setPoidsUnitaire] = useState(0);
	const [qteUtilise, setQteUtilise] = useState(0);
	const [dateAchat, setDateAchat] = useState("");
	const [categorie, setCategorie] = useState("aliments");
	const [profitsList, setProfitsList] = useState(
		JSON.parse(LocalStorage.getItem("profitsList")) &&
			JSON.parse(LocalStorage.getItem("profitsList")).length != 0
			? JSON.parse(LocalStorage.getItem("profitsList"))
			: []
	);

	const [consommation, setConsommation] = useState("aliments");
	//data consommation aliment
	const [qteAlimentUtilise, setQteAlimentUtilise] = useState(0);
	const [date_debut, setDateDebut] = useState("");
	const [date_fin, setDateFin] = useState("");
	const [alimentList, setAlimentList] = useState(
		JSON.parse(LocalStorage.getItem("alimentList")) &&
			JSON.parse(LocalStorage.getItem("alimentList")).length != 0 &&
			JSON.parse(LocalStorage.getItem("alimentList"))[0].vagueId ==
				vagueId
			? JSON.parse(LocalStorage.getItem("alimentList"))
			: []
	);
	const [alimentId, setAlimentId] = useState("");

	//data consommation medicaments
	const [qteSoinsConsomme, setQteSoinsConsomme] = useState(0);
	const [date_consommation, setDate_consommation] = useState("");
	const [soin_medicalList, setSoin_medicalList] = useState(
		JSON.parse(LocalStorage.getItem("soin_medicalList")) &&
			JSON.parse(LocalStorage.getItem("soin_medicalList")).length != 0 &&
			JSON.parse(LocalStorage.getItem("soin_medicalList"))[0].vagueId ==
				vagueId
			? JSON.parse(LocalStorage.getItem("soin_medicalList"))
			: []
	);
	const [soinsMedicalId, setSoinsMedicalId] = useState("");

	const [isBudgetPropre, setIsBudgetPropre] = useState(true);
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

	const addConsommation = () => {
		let data = {};
		let apiPath = "";
		if (consommation == "aliments") {
			apiPath = "alimentutilise";
			data = {
				alimentId: alimentId,
				qteUtilise: qteAlimentUtilise,
				date_debut: new Date(date_debut).toDateString(),
				date_fin: new Date(date_fin).toDateString(),
			};
			if (alimentId == "") {
				return showAlertError(
					"Faudrait préciser l'aliment à consommer"
				);
			}
		} else {
			apiPath = "soinsConsomme";
			data = {
				soinsMedicalId: soinsMedicalId,
				qteUtilise: qteSoinsConsomme,
				date_consommation: new Date(date_consommation).toDateString(),
			};
			if (soinsMedicalId == "") {
				return showAlertError(
					"Faudrait préciser le médicament à consommer"
				);
			}
		}
		setLoading(true);
		Axios.post(`/api/${apiPath}`, data)
			.then((response) => {
				props.funtionToUpdate();
				if (response.status === 201)
					showAlertSuccess(response.data.message);
				else showAlertError("Verifiez vos champs et recommencez");
				setLoading(false);
			})
			.catch((error) => {
				console.log(error);
				showAlertError(error.response.data.message);
				setLoading(false);
			});
	};

	const addDepense = () => {
		if (sourceFinancementId == "")
			return showAlertError("Selectionner une source de financement");
		setLoading(true);
		if (fournisseur) {
			let type = "";
			if (categorie == "amenagement") type = "Aménagement du local";
			else if (categorie == "soin_medical") type = "Médicaments";
			else type = "Aliments";
			Axios.post(`/api/fournisseur/check`, {
				fournisseur: fournisseur,
				type: type,
			}).then(() => {
				Axios.get(`/api/fournisseur/${fournisseur}`).then(
					(response) => {
						setFournisseurId(response.data._id);
					}
				);
			});
		}
		let data = {};
		if (
			categorie == "electricite" ||
			categorie == "eau" ||
			categorie == "main_doeuvre" ||
			categorie == "autre_depense"
		) {
			data = {
				vagueId: vagueId,
				titre: titreDepense,
				prix: prix,
				source_financementId: sourceFinancementId,
				facture: "",
			};
		} else if (categorie == "soin_medical" || categorie == "amenagement") {
			data = {
				vagueId: vagueId,
				titre: titreDepense,
				quantite: quantite,
				prix: prix,
				source_financementId: sourceFinancementId,
				fournisseur: fournisseur,
				fournisseurId: fournisseurId,
				transport: transport,
				facture: "",
			};
		} else if (categorie == "location_local") {
			data = {
				vagueId: vagueId,
				titre: titreDepense,
				emplacement: emplacement,
				prix: prix,
				transport: transport,
				source_financementId: sourceFinancementId,
				facture: "",
			};
		} else if (categorie == "transport_vente") {
			data = {
				vagueId: vagueId,
				destination: destination,
				prix: prix,
				source_financementId: sourceFinancementId,
				transporteur: transporteur,
				facture: "",
			};
		} else {
			data = {
				vagueId: vagueId,
				titre: typeDepenseAliment,
				quantite: quantite,
				prix: prix,
				source_financementId: sourceFinancementId,
				fournisseur: fournisseur,
				fournisseurId: fournisseurId,
				transport: transport,
				poidsUnitaire: poidsUnitaire,
				qteUtilise: qteUtilise,
				dateAchat: new Date(dateAchat).toDateString(),
				facture: "",
			};
		}

		Axios.post(`/api/${categorie}`, data)
			.then((response) => {
				props.funtionToUpdate();
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

	const addVente = (vagueId) => {
		setLoading(true);
		if (acheteur) {
			Axios.post(`/api/acheteur/check`, {
				acheteur: acheteur,
				tel_acheteur: telAcheteur,
			}).then(() => {
				Axios.get(`/api/acheteur/${acheteur}`).then((response) => {
					setAcheteurId(response.data._id);
				});
			});
		}
		let reste = 0;
		let avance = 0;
		if (modePayement == "Immédiat") {
			avance = montantVente;
			reste = 0;
		} else {
			avance = montantAvance;
			reste = montantVente - montantAvance;
		}
		Axios.post("/api/vente", {
			vagueId: vagueId,
			qte_vendu: nbreSujetVendu,
			prix_vente: montantVente,
			poids_total_vendu: poidsTotalVente,
			mode_payement: modePayement,
			montant_avance: avance,
			montant_restant: reste,
			mode_encaissement: modeEncaissement,
			date_vente: new Date(dateVente).toDateString(),
			acheteur: acheteur,
			acheteurId: acheteurId,
			tel_acheteur: telAcheteur,
		})
			.then((response) => {
				props.funtionToUpdate();
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

	const addPerte = (vagueId) => {
		setLoading(true);
		Axios.post(`api/results/valeur_sur_date/${vagueId}`, {
			date: new Date(datePerte).toDateString(),
		})
			.then((res) => {
				if (res.status === 200) {
					Axios.post("/api/perte", {
						vagueId: vagueId,
						qte_perdu: nbrePerte,
						valeur_perdu: res.data.valeurSurDate * nbrePerte,
						date_perte: new Date(datePerte).toDateString(),
					})
						.then((response) => {
							if (response.status === 201) {
								showAlertSuccess(response.data.message);
								props.funtionToUpdate();
							} else
								showAlertError(
									"Verifiez vos champs et recommencez"
								);
							setLoading(false);
						})
						.catch((error) => {
							showAlertError(error.response.data.message);
							console.log(error);
							setLoading(false);
						});
				}
			})
			.catch((error) => {
				console.log(error);
				showAlertError(error.response.data.message);
				setLoading(false);
			});
	};

	const addVague = () => {
		setLoading(true);
		if (fournisseur) {
			Axios.post(`/api/fournisseur/check`, {
				fournisseur: fournisseur,
				type: "Sujets",
			}).then(() => {
				Axios.get(`/api/fournisseur/${fournisseur}`).then(
					(response) => {
						setFournisseurId(response.data._id);
					}
				);
			});
		}
		Axios.post("/api/customers/vague", {
			titre: titre,
			qte_animaux: qte_animaux,
			prix_unitaire: prix_unitaire,
			fournisseur: fournisseur,
			fournisseurId: fournisseurId,
			etat: etat,
			enStock: enStock,
		})
			.then((response) => {
				setLoading(false);
				if (response.status === 201) {
					showAlertSuccess(response.data.message);
					props.funtionToUpdate();
				} else {
					showAlertError("Verifiez vos champs et recommencez");
				}
			})
			.catch((error) => {
				setLoading(false);
				showAlertError(error.response.data.message);
			});
	};

	const autoCompleteFournisseur = (event) => {
		setFournisseur(event.target.value.toUpperCase());
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

	const autoCompleteAcheteur = (event) => {
		setAcheteur(event.target.value.toUpperCase());
		const filteredAcheteur = acheteursFromDb.filter((acheteur) =>
			acheteur.nom
				.toUpperCase()
				.includes(event.target.value.toUpperCase())
		);
		setAcheteursList(filteredAcheteur);
		if (event.target.value.length == 0) {
			setAcheteursList([]);
			setTelAcheteur("");
		}
	};

	const getProfits = () => {
		Axios.get(`/api/profits/`).then((response) => {
			if (response.status === 200) {
				LocalStorage.setItem(
					"profitsList",
					JSON.stringify(response.data)
				);
				setProfitsList(response.data);
			}
		});
	};

	const getAcheteurs = () => {
		Axios.get(`/api/acheteur/all`).then((response) => {
			if (response.status === 200) {
				LocalStorage.setItem(
					"acheteursFromDb",
					JSON.stringify(response.data)
				);
				setAcheteurFromDb(response.data);
			}
		});
	};

	const getFournisseurs = () => {
		Axios.get(`/api/fournisseur/all`).then((res) => {
			if (res.status === 200) {
				LocalStorage.setItem(
					"fournisseursFromDb",
					JSON.stringify(res.data)
				);
				setFournisseursFromDb(res.data);
			}
		});
	};

	const getAliments = () => {
		Axios.get(`/api/aliments/all/${vagueId}`).then((response) => {
			setAlimentList(response.data);
			if (response.data.length > 0) {
				setAlimentId(response.data[0]._id);
			}
			LocalStorage.setItem("alimentList", JSON.stringify(response.data));
		});
	};
	const getSoin_medical = () => {
		Axios.get(`/api/soin_medical/all/${vagueId}`).then((response) => {
			setSoin_medicalList(response.data);
			if (response.data.length > 0) {
				setSoinsMedicalId(response.data[0]._id);
			}
			LocalStorage.setItem(
				"soin_medicalList",
				JSON.stringify(response.data)
			);
		});
	};

	useEffect(() => {
		getAliments();
		getSoin_medical();
		setAlimentId(alimentList.length != 0 ? alimentList[0]._id : "");
		setSoinsMedicalId(
			soin_medicalList.length != 0 ? soin_medicalList[0]._id : ""
		);
		getFournisseurs();
		getAcheteurs();
		getProfits();
	}, []);

	const handleClose = () => {
		setShow(false);
	};
	const handleShow = () => {
		setShow(true);
	};

	const loggedIn = () => {
		if (JSON.parse(LocalStorage.getItem("userToken"))) {
			return true;
		} else {
			return false;
		}
	};

	const timeExprired = () => {
		const _at = JSON.parse(LocalStorage.getItem("_at"));
		let timeExpiration = Math.round((Date.now() - _at) / (3600 * 1000));
		if (timeExpiration == NaN || timeExpiration >= 24) {
			return true;
		} else {
			return false;
		}
	};

	if (!loggedIn() || timeExprired()) {
		LocalStorage.clear();
		return <Navigate to={"/sign-in"} replace={true}></Navigate>;
	}

	// useEffect(() => {
	// 	setVagueId(
	// 		props.VAGUEID
	// 			? props.VAGUEID
	// 			: JSON.parse(LocalStorage.getItem("vagueId"))
	// 	);
	// }, [props.VAGUEID]);

	useEffect(() => {
		getProfilUser();
		getCurrentVague(vagueList);
	}, [props.VAGUEID, vagueId]);

	const logout = () => {
		LocalStorage.clear();
		location.reload();
	};

	//recuperer les infos du profil de l'utilisateur
	const getProfilUser = () => {
		const userId = JSON.parse(LocalStorage.getItem("userId"));
		Axios.get(`api/auth/show/${userId}`)
			.then((res) => {
				if (res.status === 200) {
					LocalStorage.setItem("profil", JSON.stringify(res.data));
					setProfil(res.data);
				}
			})
			.catch(() => {
				setProfil(JSON.parse(LocalStorage.getItem("profil")));
			});
	};

	const getCurrentVague = (vagueList) => {
		let v = {};
		vagueList.forEach((vague) => {
			if (vague._id == vagueId) {
				v = vague;
			}
		});
		setCurrentVague(v);
	};

	const getNom = () => {
		if (profil) return profil.nom;
	};

	const getTitreCurrentVague = () => {
		if (currentVague) return currentVague.titre;
	};

	return (
		<div>
			<div>
				<div>
					<nav className="navbar col-lg-12 col-12 p-0 fixed-top d-flex flex-row">
						<div className="text-center navbar-brand-wrapper d-flex align-items-center justify-content-center">
							<Link
								to="/"
								className="navbar-brand brand-logo mr-5"
								data-toggle="collapse"
								aria-expanded="false"
								aria-controls="form-elements"
							>
								<img src={logo} className="mr-2" alt="logo" />
							</Link>
							<Link
								to="/"
								className="navbar-brand brand-logo-mini"
								data-toggle="collapse"
								aria-expanded="false"
								aria-controls="form-elements"
							>
								<img src={logoMini} alt="logo" />
							</Link>
						</div>
						<div className="navbar-menu-wrapper d-flex align-items-center justify-content-end">
							{!vagueId ? (
								""
							) : (
								<div className="col-xl-9 d-sm-block d-none">
									<nav
										aria-label="breadcrumb"
										className="col-lg-12"
									>
										<ol className="breadcrumb d-flex align-items-center justify-content-between bg-white m-0">
											{/* <li className="breadcrumb-item">
												<Link to="/pages/ferme">
													{this.getTitreCurrentFerme()}
												</Link>
											</li> */}
											<li className="breadcrumb-item">
												<Link to="/pages/vagues">
													{getTitreCurrentVague()}
												</Link>
												<BarLoader
													color={"#E91E63"}
													loading={
														currentVague.etat == 1
															? true
															: false
													}
													size={135}
													aria-label="Loading Spinner"
													data-testid="loader"
												/>
											</li>
											{currentVague.etat == 2 ? (
												<li className="">
													<Link
														to={`/pages/vagues/${vagueId}/rapport`}
														className="text-primary text-decoration-underline"
														style={{
															fontWeight: "bold",
														}}
													>
														{" "}
														<i class="tim-icons icon-badge mx-2 pb-1"></i>
														RAPPORT{" "}
													</Link>
												</li>
											) : (
												""
											)}
										</ol>
									</nav>
								</div>
							)}

							<Nav
								className="align-items-center d-none d-md-flex"
								navbar
							>
								<Button
									className="navbar-toggler navbar-toggler-right bg-white d-lg-none align-self-center"
									type="button"
									data-toggle="offcanvas"
									onClick={handleShow}
								>
									<span className="icon-menu"></span>
								</Button>
								<Offcanvas
									show={show}
									onHide={handleClose}
									className="d-lg-none"
									style={{ width: "80%" }}
								>
									<Offcanvas.Body
										style={{
											background: "rgb(245, 247, 255)",
											height: "100%",
										}}
									>
										<span
											className="position-absolute fs-2 font-weight-bold py-1 px-2"
											style={{
												right: "15px",
												top: "6px",
												color: "rgba(255, 0, 0, 0.444)",
											}}
											onClick={handleClose}
										>
											X
										</span>
										<nav
											className="sidebar w-100"
											id="sidebar"
											style={{
												backgroundColor: "#f0f0ff",
												borderRight:
													"5px solid rgba(76, 16, 255, 0.444)",
												height: "100%",
											}}
										>
											<div className="navbar-menu-wrapper d-flex align-items-center justify-content-end">
												<ul
													className="nav"
													style={{
														width: "100%",
														height: "100%",
														overflow: "auto",
													}}
												>
													<li className="nav-item">
														<Link
															to="/pages/vagues"
															className={`nav-link`}
															style={{
																color: window.location.pathname.includes(
																	"vague"
																)
																	? "rgba(76, 16, 255, 0.777)"
																	: "",
															}}
															data-toggle="collapse"
															aria-expanded="false"
															aria-controls="ui-basic"
														>
															{/* <i
																className="tim-icons icon-components menu-icon"
																style={{
																	color: window.location.pathname.includes(
																		"dashboard"
																	)
																		? "rgba(76, 16, 255, 0.777)"
																		: "",
																}}
															></i> */}
															<i
																className="icon-grid menu-icon"
																style={{
																	color: window.location.pathname.includes(
																		"vagues"
																	)
																		? "rgba(76, 16, 255, 0.777)"
																		: "",
																}}
															></i>
															<span className="menu-title">
																Liste des Vagues
															</span>
														</Link>
													</li>
													<li
														className="nav-item"
														onClick={handleClose}
													>
														<a
															className={`nav-link`}
															data-bs-target="#ajoutVague"
															data-bs-toggle="modal"
															data-bs-dismiss="modal"
														>
															<i class="tim-icons icon-simple-add menu-icon font-weight-bold"></i>
															<span className="menu-title">
																Ajouter une
																vague
															</span>
														</a>
													</li>
													<li
														className={`nav-item ${
															!vagueId ||
															currentVague.etat ==
																2
																? "d-none"
																: ""
														}`}
														onClick={handleClose}
													>
														<a
															className={`nav-link`}
															data-bs-target="#ajoutDepense"
															data-bs-toggle="modal"
															data-bs-dismiss="modal"
														>
															<i class="tim-icons icon-chart-pie-36  menu-icon font-weight-bold"></i>
															<span className="menu-title">
																Ajouter une
																dépense
															</span>
														</a>
													</li>
													<li
														className={`nav-item ${
															!vagueId ||
															currentVague.etat ==
																2
																? "d-none"
																: ""
														}`}
														onClick={handleClose}
													>
														<a
															className={`nav-link`}
															data-bs-target="#addConsommationModal"
															data-bs-toggle="modal"
															data-bs-dismiss="modal"
														>
															<i class="tim-icons icon-components menu-icon"></i>
															<span className="menu-title">
																Consommations
															</span>
														</a>
													</li>
													<li
														className={`nav-item ${
															!vagueId ||
															currentVague.etat ==
																2
																? "d-none"
																: ""
														}`}
														onClick={handleClose}
													>
														<a
															className={`nav-link`}
															data-bs-target="#ajoutPerte"
															data-bs-toggle="modal"
															data-bs-dismiss="modal"
														>
															<i class="tim-icons icon-alert-circle-exc  menu-icon font-weight-bold"></i>
															<span className="menu-title">
																Ajouter une
																perte
															</span>
														</a>
													</li>
													<li
														className={`nav-item ${
															!vagueId ||
															currentVague.etat ==
																2
																? "d-none"
																: ""
														}`}
														onClick={handleClose}
													>
														<a
															className={`nav-link`}
															data-bs-target="#ajoutVente"
															data-bs-toggle="modal"
															data-bs-dismiss="modal"
														>
															<i class="tim-icons icon-coins  menu-icon"></i>
															<span className="menu-title">
																Ajouter une
																vente
															</span>
														</a>
													</li>
													<li
														className={`nav-item ${
															!vagueId ||
															currentVague.etat ==
																2
																? "d-none"
																: ""
														}`}
													>
														<Link
															to={`/pages/vagues/${vagueId}/profits`}
															className="nav-link"
															style={{
																color: window.location.pathname.includes(
																	"profits"
																)
																	? "rgba(76, 16, 255, 0.777)"
																	: "",
															}}
															data-toggle="collapse"
															aria-expanded="false"
															aria-controls="form-elements"
														>
															<i
																className="tim-icons icon-trophy menu-icon"
																style={{
																	color: window.location.pathname.includes(
																		"profits"
																	)
																		? "rgba(76, 16, 255, 0.777)"
																		: "",
																}}
															></i>
															<span className="menu-title">
																Profits des
																vagues
															</span>
														</Link>
													</li>
													<li className="nav-item">
														<Link
															to="/pages/fournisseur"
															className="nav-link"
															style={{
																color: window.location.pathname.includes(
																	"fournisseur"
																)
																	? "rgba(76, 16, 255, 0.777)"
																	: "",
															}}
															data-toggle="collapse"
															aria-expanded="false"
															aria-controls="form-elements"
														>
															<i
																className="tim-icons icon-delivery-fast menu-icon"
																style={{
																	color: window.location.pathname.includes(
																		"fournisseur"
																	)
																		? "rgba(76, 16, 255, 0.777)"
																		: "",
																}}
															></i>
															<span className="menu-title">
																Liste des
																fournisseurs
															</span>
														</Link>
													</li>
												</ul>
											</div>
										</nav>
									</Offcanvas.Body>
								</Offcanvas>

								<UncontrolledDropdown nav>
									<DropdownToggle className="pr-0" nav>
										<ul className="navbar-nav navbar-nav-right">
											{/* <utton
												className="navbar-toggler navbar-toggler-right d-lg-none align-self-center"
												type="button"
												data-toggle="offcanvas"
											>
												<span className="icon-menu"></span>
											</utton> */}

											<Media className="align-items-center">
												<li className="nav-item nav-profile dropdown">
													<a
														className="nav-link dropdown-toggle"
														href="#"
														data-toggle="dropdown"
														id="profileDropdown"
													>
														<img src={face28} />
													</a>
												</li>
												<Media className="d-none d-lg-block">
													<span className="mb-0 text-sm font-weight-bold">
														{getNom()}
													</span>
												</Media>
											</Media>
										</ul>
									</DropdownToggle>
									<DropdownMenu
										className="dropdown-menu-arrow"
										right
									>
										<DropdownItem
											className="noti-title"
											header
											tag="div"
										>
											<h6 className="text-overflow m-0">
												Bienvenu !
											</h6>
										</DropdownItem>
										<DropdownItem divider />
										<DropdownItem
											to="/pages/profil"
											tag={Link}
										>
											<i className="ni ni-settings-gear-65" />
											<span>
												{" "}
												<i class="tim-icons icon-single-02"></i>
												Mon Profil
											</span>
										</DropdownItem>
										<DropdownItem divider />
										<DropdownItem
											href=""
											onClick={() => logout()}
										>
											<i className="ni ni-user-run" />
											<span>
												{" "}
												<i class="tim-icons icon-button-power text-danger"></i>
												Logout
											</span>
										</DropdownItem>
									</DropdownMenu>
								</UncontrolledDropdown>
							</Nav>
						</div>
					</nav>
				</div>
				{window.location.pathname.endsWith("profil") ||
				window.location.pathname.endsWith("profil/edit") ||
				window.location.pathname.includes("/rapport") ? (
					""
				) : (
					<SideBar VAGUEID={vagueId} currentVague={currentVague} />
				)}

				<div
					id="ajoutVague"
					class="modal fade text-dark"
					aria-hidden="true"
					aria-labelledby="ajoutVagueLabel"
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
								addVague();
							}}
							class="modal-content"
						>
							<div class="modal-header">
								<h5 class="modal-title" id="ajoutVagueLabel">
									Création d'une nouvelle vague.
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
									<input
										type="hidden"
										onChange={(event) => {
											setUserId(event.target.value);
										}}
									/>
								</div>
								<div className="form-group">
									<label>
										Titre{" "}
										<span
											style={{
												fontWeight: "bold",
												color: "red",
											}}
										>
											*
										</span>
									</label>
									<input
										required
										type="text"
										onChange={(event) => {
											setTitre(event.target.value);
										}}
										className="form-control"
										value={titre}
										placeholder="Donnez un titre à votre vague"
										title="Donnez un titre à votre vague"
									/>
								</div>
								<div className="form-group">
									<label>
										Nombre d'animaux{" "}
										<span
											style={{
												fontWeight: "bold",
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
										onChange={(event) => {
											setQteAnimaux(event.target.value);
											setEnStock(event.target.value);
										}}
										className="form-control"
										value={qte_animaux}
										placeholder="Entrez le nombre d'animaux acheté"
										title="Entrez le nombre d'animaux acheté"
									/>
								</div>
								<div className="form-group">
									<label>
										Prix unitaire d'un animal{" "}
										<span
											style={{
												fontWeight: "bold",
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
										onChange={(event) => {
											setPrixUnitaire(event.target.value);
										}}
										className="form-control"
										value={prix_unitaire}
										placeholder="Entrez le prix d'un animal"
										title="Entrez le prix d'un animal"
									/>
								</div>
								<div className="form-group">
									<label>Fournisseur</label>
									<input
										type="text"
										onChange={(event) => {
											autoCompleteFournisseur(event);
										}}
										className="form-control"
										value={fournisseur}
										placeholder="Entrez le nom du fournisseur"
										title="Entrez le nom du fournisseur"
									/>
									{fournisseursList.length != 0 ? (
										<ul
											className="list-unstyled px-3 position-absolute bg-gradient-secondary"
											style={{
												height: "130px",
												width: "90%",
												overflow: "auto",
											}}
										>
											{fournisseursList.map(
												(fournisseur) => {
													return (
														<li
															key={
																fournisseur._id
															}
															onClick={(e) => {
																setFournisseur(
																	fournisseur.nom
																);
																setFournisseursList(
																	[]
																);
															}}
														>
															{fournisseur.nom} (
															{fournisseur.score})
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
					id="ajoutPerte"
					class="modal fade text-dark"
					aria-hidden="true"
					aria-labelledby="ajoutPerteLabel"
					tabindex="-1"
					data-bs-keyboard="false"
				>
					<div
						class="modal-dialog modal-dialog-centered modal-md modal-dialog-scrollable"
						style={{ margin: "auto", marginTop: "30px" }}
					>
						<form
							onSubmit={(event) => {
								event.preventDefault();
								addPerte(vagueId);
							}}
							class="modal-content"
						>
							<div class="modal-header">
								<h5 class="modal-title" id="ajoutPerteLabel">
									Ajout d'une perte en sujet.
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
										Nombre de sujet perdu{" "}
										<span
											style={{
												fontWeight: "bold",
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
										onChange={(event) => {
											setNbrePerte(event.target.value);
										}}
										className="form-control"
										placeholder="Entrez le nombre de sujet perdu"
										title="Entrez le nombre de sujet perdu"
									/>
								</div>
								<div className="form-group">
									<label>
										Date de la perte{" "}
										<span
											style={{
												fontWeight: "bold",
												color: "red",
											}}
										>
											*
										</span>
									</label>
									<input
										required
										type="date"
										onChange={(event) => {
											setDatePerte(event.target.value);
										}}
										className="form-control"
										value={datePerte}
										placeholder="Entrez la date réelle de la perte"
										title="Entrez la date réelle de la perte"
									/>
								</div>
							</div>
							<div class="modal-footer">
								<button
									className="btn btn-outline-danger m-auto btn-fw"
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
					id="ajoutVente"
					class="modal fade text-dark"
					aria-hidden="true"
					aria-labelledby="ajoutVenteLabel"
					tabindex="-1"
					data-bs-keyboard="false"
				>
					<div
						class="modal-dialog modal-dialog-centered modal-md modal-dialog-scrollable"
						style={{ margin: "auto", marginTop: "30px" }}
					>
						<form
							onSubmit={(event) => {
								event.preventDefault();
								addVente(vagueId);
							}}
							class="modal-content"
						>
							<div class="modal-header">
								<h5 class="modal-title" id="ajoutVenteLabel">
									Ajout d'une vente réalisée.
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
										Nombre de sujet vendu{" "}
										<span
											style={{
												fontWeight: "bold",
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
										onChange={(event) => {
											setNbreSujetVendu(
												event.target.value
											);
										}}
										className="form-control"
										placeholder="Entrez le nombre de sujet vendu"
										title="Entrez le nombre de sujet vendu"
									/>
								</div>
								<div className="form-group">
									<label>
										Montant de la vente{" "}
										<span
											style={{
												fontWeight: "bold",
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
										onChange={(event) => {
											setMontantVente(event.target.value);
										}}
										className="form-control"
										placeholder="Entrez le montant total de la vente"
										title="Entrez le montant total de la vente"
									/>
								</div>
								<div className="form-group">
									<label>
										Poids total de la vente (Kg){" "}
										<span
											style={{
												fontWeight: "bold",
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
										step={0.1}
										onChange={(event) => {
											setPoidsTotalVente(
												event.target.value
											);
										}}
										className="form-control"
										placeholder="Entrez le poids total de la vente"
										title="Entrez le poids total de la vente"
									/>
								</div>
								<div className="form-group">
									<label>
										Mode de payement{" "}
										<span
											style={{
												fontWeight: "bold",
												color: "red",
											}}
										>
											*
										</span>
									</label>
									<select
										className="form-control"
										required
										onChange={(event) =>
											setModePayement(event.target.value)
										}
										placeholder="La vente est-elle à crédit ?"
										title="La vente est-elle à crédit ?"
									>
										<option value={"Immédiat"}>
											Immédiat
										</option>
										<option value={"Différé"}>
											Différé
										</option>
									</select>
								</div>
								{modePayement == "Différé" ? (
									<div className="form-group">
										<label>
											Prémière avance récue{" "}
											<span
												style={{
													fontWeight: "bold",
													color: "red",
												}}
											>
												*
											</span>
										</label>
										<input
											required
											type={
												modePayement == "Différé"
													? "number"
													: "hidden"
											}
											min={0}
											onChange={(event) => {
												setMontantAvance(
													event.target.value
												);
											}}
											className="form-control"
											placeholder="Entrez le montant avancé par l'acheteur"
											title="Entrez le montant avancé par l'acheteur"
										/>
									</div>
								) : (
									""
								)}
								<div className="form-group">
									<label>
										Mode d'encaissement{" "}
										<span
											style={{
												fontWeight: "bold",
												color: "red",
											}}
										>
											*
										</span>
									</label>
									<select
										className="form-control"
										required
										onChange={(event) =>
											setModeEncaissement(
												event.target.value
											)
										}
										placeholder="Entrez le mode d'encaissement"
										title="Entrez le mode d'encaissement"
									>
										<option value={"Espèces"}>
											Espèces
										</option>
										<option value={"Virement"}>
											Virement
										</option>
										<option value={"Mobile"}>Mobile</option>
									</select>
								</div>
								<div className="form-group">
									<label>
										Date de la vente{" "}
										<span
											style={{
												fontWeight: "bold",
												color: "red",
											}}
										>
											*
										</span>
									</label>
									<input
										required
										type="date"
										onChange={(event) => {
											setDateVente(event.target.value);
										}}
										className="form-control"
										value={dateVente}
										placeholder="Entrez la date réelle de la vente"
										title="Entrez la date réelle de la vente"
									/>
								</div>
								<div className="form-group">
									<label>Acheteur </label>
									<input
										type="text"
										onChange={(event) => {
											autoCompleteAcheteur(event);
										}}
										className="form-control"
										value={acheteur}
										placeholder="Entrez le nom de l'acheteur"
										title="Entrez le nom de l'acheteur"
									/>
									{acheteursList.length != 0 ? (
										<ul
											className="list-unstyled px-3 position-absolute bg-gradient-secondary"
											style={{
												height: "130px",
												width: "90%",
												overflow: "auto",
											}}
										>
											{acheteursList.map((acheteur) => {
												return (
													<li
														key={acheteur._id}
														onClick={(e) => {
															setAcheteur(
																acheteur.nom
															);
															setTelAcheteur(
																acheteur.tel
															);
															setAcheteursList(
																[]
															);
														}}
													>
														{acheteur.nom}
													</li>
												);
											})}
										</ul>
									) : (
										""
									)}
								</div>
								<div className="form-group">
									<label>Téléphone de l'acheteur </label>
									<input
										type="number"
										min={0}
										onChange={(event) => {
											setTelAcheteur(event.target.value);
										}}
										className="form-control"
										value={telAcheteur}
										placeholder="Entrez le numéro de téléphone de l'acheteur"
										title="Entrez le numéro de téléphone de l'acheteur"
									/>
								</div>
							</div>
							<div class="modal-footer">
								<button
									className="btn btn-outline-success m-auto btn-fw"
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
					id="ajoutDepense"
					class="modal fade text-dark"
					aria-hidden="true"
					aria-labelledby="ajoutDepenseLabel"
					tabindex="-1"
					data-bs-keyboard="false"
				>
					<div
						class="modal-dialog modal-dialog-centered modal-md modal-dialog-scrollable"
						style={{ margin: "auto", marginTop: "30px" }}
					>
						<form
							onSubmit={(event) => {
								event.preventDefault();
								addDepense();
							}}
							class="modal-content"
						>
							<div class="modal-header">
								<h5 class="modal-title" id="ajoutDepenseLabel">
									Ajouter une dépense.
								</h5>
								<button
									class="btn-close"
									type="button"
									data-bs-dismiss="modal"
									aria-label="Close"
								></button>
							</div>
							<div class="modal-body py-2 px-3">
								<div className={`form-group`}>
									<label>
										Catégorie{" "}
										<span
											style={{
												fontWeight: "bold",
												color: "red",
											}}
										>
											*
										</span>
									</label>
									<select
										className="form-control"
										required
										onChange={(event) =>
											setCategorie(event.target.value)
										}
										placeholder="Sélectionnez la catégorie sur laquelle ajouter la dépense."
										title="Sélectionnez la catégorie sur laquelle ajouter la dépense."
									>
										<option value={"aliments"}>
											Aliments
										</option>
										<option value={"soin_medical"}>
											Médicaments
										</option>
										<option value={"amenagement"}>
											Aménagements
										</option>
										<option value={"location_local"}>
											Locations locaux
										</option>
										<option value={"electricite"}>
											Electricités
										</option>
										<option value={"eau"}>Eaux</option>
										<option value={"autre_depense"}>
											Autres dépenses
										</option>
										<option value={"main_doeuvre"}>
											Resources humaines
										</option>
										<option value={"transport_vente"}>
											Charges de livraison
										</option>
									</select>
								</div>
								<div
									className={`form-group ${
										categorie == "transport_vente" ||
										categorie == "aliments"
											? "d-none"
											: ""
									}`}
								>
									<label>
										Titre de la dépense:{" "}
										<span
											style={{
												fontWeight: "bold",
												color: "red",
											}}
										>
											*
										</span>
									</label>
									<input
										type={`${
											categorie == "transport_vente" ||
											categorie == "aliments"
												? "hidden"
												: "text"
										}`}
										onChange={(event) => {
											setTitreDepense(event.target.value);
										}}
										className="form-control"
										placeholder="Donnez un titre à la dépense réalisée."
										title="Donnez un titre à la dépense réalisée."
										required
									/>
								</div>
								<div
									className={`form-group ${
										categorie != "aliments" ? "d-none" : ""
									}`}
								>
									<label>
										Type d'aliment{" "}
										<span
											style={{
												fontWeight: "bold",
												color: "red",
											}}
										>
											*
										</span>
									</label>
									<select
										className={`form-control ${
											categorie != "aliments"
												? "visually-hidden"
												: ""
										}`}
										required
										onChange={(event) => {
											setTypeDepenseAliment(
												event.target.value
											);
										}}
										placeholder="Choisissez le type d'aliment"
										title="Choisissez le type d'aliment"
									>
										<option
											value={"Aliment de prédémarrage"}
										>
											Aliment de prédémarrage
										</option>
										<option value={"Aliment de démarrage"}>
											Aliment de démarrage
										</option>
										<option value={"Aliment de croissance"}>
											Aliment de croissance
										</option>
										<option value={"Aliment de finition"}>
											Aliment de finition
										</option>
										<option
											value={"Complément alimentaire"}
										>
											Complément alimentaire
										</option>
									</select>
								</div>
								<div
									className={`form-group ${
										categorie != "transport_vente"
											? "d-none"
											: ""
									}`}
								>
									<label>
										Destination:{" "}
										<span
											style={{
												fontWeight: "bold",
												color: "red",
											}}
										>
											*
										</span>
									</label>
									<input
										type={`${
											categorie != "transport_vente"
												? "hidden"
												: "text"
										}`}
										onChange={(event) => {
											setDestination(event.target.value);
										}}
										className="form-control"
										placeholder="Destination de la vente"
										required
									/>
								</div>
								<div className={`form-group`}>
									<label>
										Prix total de la dépense:{" "}
										<span
											style={{
												fontWeight: "bold",
												color: "red",
											}}
										>
											*
										</span>
									</label>
									<input
										type="number"
										min={1}
										onChange={(event) => {
											setPrix(event.target.value);
											getProfits();
										}}
										className="form-control"
										placeholder="Entrez le prix totale de la dépense réalisée."
										title="Entrez le prix totale de la dépense réalisée."
										required
									/>
								</div>
								<div
									className={`form-group ${
										categorie != "location_local"
											? "d-none"
											: ""
									}`}
								>
									<label>
										Emplacement:{" "}
										<span
											style={{
												fontWeight: "bold",
												color: "red",
											}}
										>
											*
										</span>
									</label>
									<input
										type={`${
											categorie != "location_local"
												? "hidden"
												: "text"
										}`}
										onChange={(event) => {
											setEmplacement(event.target.value);
										}}
										className="form-control"
										placeholder="Emplacement loué"
										required
									/>
								</div>
								<div
									className={`form-group ${
										categorie != "aliments" &&
										categorie != "amenagement" &&
										categorie != "soin_medical"
											? "d-none"
											: ""
									}`}
								>
									<label>
										{categorie == "aliments"
											? "Nombre de sacs achetés"
											: "Quantité achetée:"}
										<span
											style={{
												fontWeight: "bold",
												color: "red",
											}}
										>
											*
										</span>
									</label>
									<input
										type={`${
											categorie != "aliments" &&
											categorie != "amenagement" &&
											categorie != "soin_medical"
												? "hidden"
												: "number"
										}`}
										min={1}
										onChange={(event) => {
											setQuantite(event.target.value);
											getProfits();
										}}
										className="form-control"
										placeholder={
											categorie == "aliments"
												? "Entrer le nombre de sacs achetés"
												: "Entrer la quantité achetée:"
										}
										title={
											categorie == "aliments"
												? "Entrer le nombre de sacs achetés"
												: "Entrer la quantité achetée:"
										}
										required
									/>
								</div>
								<div
									className={`form-group ${
										categorie != "aliments" ? "d-none" : ""
									}`}
								>
									<label>
										Poids d'un sacs
										<span
											style={{
												fontWeight: "bold",
												color: "red",
											}}
										>
											*
										</span>
									</label>
									<input
										type={`${
											categorie != "aliments"
												? "hidden"
												: "number"
										}`}
										min={1}
										onChange={(event) => {
											setPoidsUnitaire(
												event.target.value
											);
											getProfits();
										}}
										className="form-control"
										placeholder={"Entrer le poids d'un sac"}
										title={"Entrer le poids d'un sac"}
										required
									/>
								</div>
								<div
									className={`form-group ${
										categorie != "aliments" ? "d-none" : ""
									}`}
									style={{ width: "100%" }}
								>
									<label>
										Date d'achat:{" "}
										<span
											style={{
												fontWeight: "bold",
												color: "red",
											}}
										>
											*
										</span>
									</label>
									<input
										type={`${
											categorie != "aliments"
												? "hidden"
												: "date"
										}`}
										onChange={(event) => {
											setDateAchat(event.target.value);
										}}
										className="form-control"
										placeholder="Entrez la date réelle d'achat des aliments"
										title="Entrez la date réelle d'achat des aliments"
										required
									/>
								</div>
								<div
									className={`form-group ${
										categorie != "transport_vente"
											? "d-none"
											: ""
									}`}
								>
									<label>Transporteur :</label>
									<input
										type={`${
											categorie != "transport_vente"
												? "hidden"
												: "text"
										}`}
										onChange={(event) => {
											setTransporteur(event.target.value);
										}}
										className="form-control"
										placeholder="Nom du transporteur"
									/>
								</div>
								<div
									className={`form-group ${
										categorie != "aliments" &&
										categorie != "amenagement" &&
										categorie != "soin_medical"
											? "d-none"
											: ""
									}`}
								>
									<label>Fournisseur:</label>
									<input
										type={`${
											categorie != "aliments" &&
											categorie != "amenagement" &&
											categorie != "soin_medical"
												? "hidden"
												: "text"
										}`}
										onChange={(event) => {
											autoCompleteFournisseur(event);
										}}
										className="form-control"
										value={fournisseur}
										placeholder="Entrez le nom du fournisseur"
										tilte="Entrez le nom du fournisseur"
									/>
									{fournisseursList.length != 0 ? (
										<ul
											className="list-unstyled px-3 position-absolute bg-gradient-secondary"
											style={{
												height: "130px",
												width: "90%",
												overflow: "auto",
											}}
										>
											{fournisseursList.map(
												(fournisseur) => {
													return (
														<li
															key={
																fournisseur._id
															}
															onClick={(e) => {
																setFournisseur(
																	fournisseur.nom
																);
																setFournisseursList(
																	[]
																);
															}}
														>
															{fournisseur.nom} (
															{fournisseur.score})
														</li>
													);
												}
											)}
										</ul>
									) : (
										""
									)}
								</div>
								<div
									className={`form-group ${
										categorie == "electricite" ||
										categorie == "eau" ||
										categorie == "autre_depense" ||
										categorie == "main_doeuvre" ||
										categorie == "transport_vente"
											? "d-none"
											: ""
									}`}
								>
									<label>Coût du tranport: </label>
									<input
										type={`${
											categorie == "electricite" ||
											categorie == "eau" ||
											categorie == "autre_depense" ||
											categorie == "main_doeuvre" ||
											categorie == "transport_vente"
												? "hidden"
												: "number"
										}`}
										min={0}
										onChange={(event) => {
											setTransport(event.target.value);
										}}
										className="form-control"
										placeholder="Coût du transport"
										title="Coût du transport"
									/>
								</div>
								<div className={`form-group`}>
									<label>
										Source de financement{" "}
										<span
											style={{
												fontWeight: "bold",
												color: "red",
											}}
										>
											*
										</span>
									</label>
									<div className="mx-4">
										<input
											type={"radio"}
											name="sourceFinancement"
											id="sourceFinancement1"
											onInput={() => {
												setIsBudgetPropre(true);
												setSourceFinancementId(
													"1111afe11f6111f11fce111c"
												);
											}}
											defaultChecked
										/>
										<label
											for="sourceFinancement1"
											className="mx-2"
										>
											Budget propre{" "}
										</label>
									</div>
									<div className="mx-4">
										<input
											type={"radio"}
											name="sourceFinancement"
											id="sourceFinancement2"
											onInput={() => {
												setIsBudgetPropre(false);
												setSourceFinancementId("");
											}}
										/>
										<label
											for="sourceFinancement2"
											className="mx-2"
										>
											Revenus d'une vague
										</label>
									</div>
									<select
										className={`${
											isBudgetPropre == true
												? "form-control"
												: "d-none"
										}`}
										onChange={(event) => {
											setSourceFinancementId(
												event.target.value
											);
										}}
										placeholder="D'où viens l'argent utilisé pour cet achat ?"
										title="D'où viens l'argent utilisé pour cet achat ?"
									>
										<option
											value={"1111afe11f6111f11fce111c"}
										>
											Espèce
										</option>
										<option
											value={"1111afe11f6111f11fce112c"}
										>
											Virement
										</option>
										<option
											value={"1111afe11f6111f11fce113c"}
										>
											Mobile
										</option>
									</select>
									<select
										className={`${
											isBudgetPropre == false
												? "form-control"
												: "d-none"
										}`}
										onChange={(event) => {
											setSourceFinancementId(
												event.target.value
											);
										}}
										placeholder="D'où viens l'argent utilisé pour cet achat ?"
										title="D'où viens l'argent utilisé pour cet achat ?"
									>
										{profitsList.map((profits) => {
											if (
												profits.montant -
													(prix * quantite +
														transport) >
													0 &&
												vagueId != profits.vagueId
											) {
												return (
													<option
														value={profits._id}
														key={profits._id}
														className="font-weight-bold text-success"
													>
														{profits.titre} (
														{Math.round(
															profits.montant
														)}{" "}
														XAF)
													</option>
												);
											}
										})}
										<option
											value={""}
											className={`text-danger`}
										>
											Aucun
										</option>
									</select>
								</div>
							</div>
							<div class="modal-footer">
								<button
									className="btn btn-outline-warning m-auto btn-fw"
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
					id="addConsommationModal"
					class="modal fade text-dark"
					aria-hidden="true"
					aria-labelledby="addConsommationModalLabel"
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
								addConsommation();
							}}
							class="modal-content"
						>
							<div class="modal-header">
								<h5
									class="modal-title"
									id="addConsommationModalLabel"
								>
									Ajout d'une consommation.
								</h5>
								<button
									class="btn-close"
									type="button"
									data-bs-dismiss="modal"
									aria-label="Close"
								></button>
							</div>
							<div class="modal-body py-2 px-3">
								<div className={`form-group`}>
									<label>
										Catégorie{" "}
										<span
											style={{
												fontWeight: "bold",
												color: "red",
											}}
										>
											*
										</span>
									</label>
									<select
										className="form-control"
										required
										onChange={(event) =>
											setConsommation(event.target.value)
										}
										placeholder="Sélectionnez le type de consommation."
										title="Sélectionnez le type de consommation."
									>
										<option value={"aliments"}>
											Aliments
										</option>
										<option value={"soin_medical"}>
											Médicaments
										</option>
									</select>
								</div>
								<div className={`form-group`}>
									<label>
										{consommation == "aliments"
											? "Aliment à consommer"
											: "Médicament à consommer"}
										<span
											style={{
												fontWeight: "bold",
												color: "red",
											}}
										>
											*
										</span>
									</label>
									<select
										className={`form-control ${
											consommation == "aliments"
												? ""
												: "d-none"
										}`}
										onChange={(event) => {
											setAlimentId(event.target.value);
										}}
										placeholder="Sélectionnez l'aliment à consommer"
										title="Sélectionnez l'aliment à consommer"
									>
										{alimentList.length == 0 ? (
											<option
												value={""}
												className="text-danger"
											>
												Aucun achat d'aliment
											</option>
										) : (
											""
										)}
										{alimentList.map((aliment) => (
											<option
												value={aliment._id}
												key={aliment._id}
											>
												{aliment.titre}
											</option>
										))}
									</select>
									<select
										className={`form-control ${
											consommation != "aliments"
												? ""
												: "d-none"
										}`}
										onChange={(event) => {
											setSoinsMedicalId(
												event.target.value
											);
										}}
										placeholder="Sélectionnez le médicament à consommer"
										title="Sélectionnez le médicament à consommer"
									>
										{soin_medicalList.length == 0 ? (
											<option
												value={""}
												className="text-danger"
											>
												Aucun achat de médicament
											</option>
										) : (
											""
										)}
										{soin_medicalList.map(
											(soins_medical) => (
												<option
													value={soins_medical._id}
													key={soins_medical._id}
												>
													{soins_medical.titre}
												</option>
											)
										)}
									</select>
								</div>
								<div className={`form-group`}>
									<label>
										Quantité (Kg){" "}
										<span
											style={{
												fontWeight: "bold",
												color: "red",
											}}
										>
											*
										</span>
									</label>
									<input
										required
										type={`${
											consommation == "aliments"
												? "number"
												: "hidden"
										}`}
										min={1}
										onChange={(event) => {
											setQteAlimentUtilise(
												event.target.value
											);
										}}
										className={`form-control ${
											consommation == "aliments"
												? ""
												: "d-none"
										}`}
										placeholder="Entrez la quantité en kg"
										title="Entrez la quantité en kg"
									/>
									<input
										required
										type={`${
											consommation != "aliments"
												? "number"
												: "hidden"
										}`}
										min={1}
										onChange={(event) => {
											setQteSoinsConsomme(
												event.target.value
											);
										}}
										className={`form-control ${
											consommation != "aliments"
												? ""
												: "d-none"
										}`}
										placeholder="Entrez la quantité en kg"
										title="Entrez la quantité en kg"
									/>
								</div>
								<div
									className={`form-group ${
										consommation == "aliments"
											? ""
											: "d-none"
									}`}
								>
									<label>
										Date de début prévue{" "}
										<span
											style={{
												fontWeight: "bold",
												color: "red",
											}}
										>
											*
										</span>
									</label>
									<input
										required
										type={`${
											consommation == "aliments"
												? "date"
												: "hidden"
										}`}
										onChange={(event) => {
											setDateDebut(event.target.value);
										}}
										className="form-control"
										value={date_debut}
										placeholder="Entez la date de début de distribution des aliments aux sujets"
										title="Entez la date de début de distribution des aliments aux sujets"
									/>
								</div>
								<div
									className={`form-group ${
										consommation == "aliments"
											? ""
											: "d-none"
									}`}
								>
									<label>
										Date de fin prévue{" "}
										<span
											style={{
												fontWeight: "bold",
												color: "red",
											}}
										>
											*
										</span>
									</label>
									<input
										required
										type={`${
											consommation == "aliments"
												? "date"
												: "hidden"
										}`}
										onChange={(event) => {
											setDateFin(event.target.value);
										}}
										className="form-control"
										value={date_fin}
										placeholder="Entez la date à laquelle la quantité entrée a été épuisée"
										title="Entez la date à laquelle la quantité entrée a été épuisée"
									/>
								</div>
								<div
									className={`form-group ${
										consommation != "aliments"
											? ""
											: "d-none"
									}`}
								>
									<label>
										Date de consommation{" "}
										<span
											style={{
												fontWeight: "bold",
												color: "red",
											}}
										>
											*
										</span>
									</label>
									<input
										required
										type={`${
											consommation != "aliments"
												? "date"
												: "hidden"
										}`}
										onChange={(event) => {
											setDate_consommation(
												event.target.value
											);
										}}
										className="form-control"
										value={date_consommation}
										placeholder="Entez la date à laquelle le médicament a été consommé."
										title="Entez la date à laquelle le médicament a été consommé."
									/>
								</div>
							</div>
							<div class="modal-footer">
								<button
									className="btn btn-outline-warning m-auto btn-fw"
									type="submit"
								>
									{" "}
									Ajouter
								</button>
							</div>
						</form>
					</div>
				</div>
				{!vagueId ? (
					""
				) : (
					<div className="d-flex justify-content-end align-items-center d-lg-none">
						<nav
							aria-label="breadcrumb"
							className="col-lg-10 mt-5"
							style={{
								position: "fixed",
								bottom: "10px",
								zIndex: "12",
							}}
						>
							<ol className="breadcrumb d-flex justify-content-between align-items-center bg-white">
								{/* <li className="breadcrumb-item">
								<Link to="/pages/ferme">
									{this.getTitreCurrentFerme()}
								</Link>
							</li> */}
								<li className="breadcrumb-item">
									<Link to="/pages/vagues">
										{getTitreCurrentVague()}
									</Link>
									<BarLoader
										color={"#E91E63"}
										loading={
											currentVague.etat == 1
												? true
												: false
										}
										size={135}
										aria-label="Loading Spinner"
										data-testid="loader"
									/>
								</li>
								{currentVague.etat == 2 ? (
									<li className="">
										<Link
											to={`/pages/vagues/${vagueId}/rapport`}
											className="text-primary text-decoration-underline"
											style={{
												fontWeight: "bold",
											}}
										>
											{" "}
											<i class="tim-icons icon-badge mx-2 pb-1"></i>
											RAPPORT{" "}
										</Link>
									</li>
								) : (
									""
								)}
							</ol>
						</nav>
					</div>
				)}
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
export default NavBar;

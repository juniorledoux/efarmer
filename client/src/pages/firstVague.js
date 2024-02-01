import React, { useState, useEffect } from "react";
import SimpleNabar from "../components/utils/simplenavbar";
import LocalStorage from "localStorage";
import Axios from "axios";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Link,
	Navigate,
} from "react-router-dom";
import Env from "../env";
import {
	Provider as AlertProvider,
	useAlert,
	positions,
	types,
	transitions,
} from "react-alert";
import ClipLoader from "react-spinners/ClipLoader";

function FirstVague() {
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
			LocalStorage.clear();
			return true;
		} else {
			return false;
		}
	};

	if (!loggedIn() || timeExprired()) {
		return <Navigate to={"/sign-in"} replace={true}></Navigate>;
	}

	const [titre, setTitre] = useState(
		"Vague du " + new Date().toLocaleDateString()
	);
	const [qte_animaux, setQteAnimaux] = useState(1000);
	const [prix_unitaire, setPrixUnitaire] = useState(600);
	const [fournisseur, setFournisseur] = useState("Non spécifié");
	const [fournisseurId, setFournisseurId] = useState("");
	const [etat, setEtat] = useState(0);
	const [enStock, setEnStock] = useState(1000);

	const [fournisseursList, setFournisseursList] = useState([]);
	const [fournisseursFromDb, setFournisseursFromDb] = useState(
		JSON.parse(LocalStorage.getItem("fournisseursFromDb"))
			? JSON.parse(LocalStorage.getItem("fournisseursFromDb"))
			: []
	);

	useEffect(() => {
		getFournisseurs();
	}, []);

	const handleSubmit = (e) => {
		e.preventDefault();
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
		fetch(`${Env.SERVER_URL}/api/customers/vague`, {
			method: "POST",
			crossDomain: true,
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				"Access-Control-Allow-Origin": "*",
				Authorization: `Bearer ${JSON.parse(
					LocalStorage.getItem("userToken")
				)}`,
			},
			body: JSON.stringify({
				titre,
				qte_animaux,
				prix_unitaire,
				fournisseur,
				fournisseurId,
				etat,
				enStock,
			}),
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.message) {
					showAlertSuccess(data.message);
					//initialiser le vagueId pour les requette qui en aurons besoin
					fetch(`${Env.SERVER_URL}/api/customers/vague`, {
						headers: {
							Authorization: `Bearer ${JSON.parse(
								LocalStorage.getItem("userToken")
							)}`,
						},
					})
						.then((res) => {
							res.json().then((vagues) => {
								// LocalStorage.setItem(
								// 	"vagueId",
								// 	JSON.stringify(vagues[0]._id)
								// );
								//tout s'est bien derouler
								window.location.href = "../pages/vagues";
							});
						})
						.catch((error) => {
							showAlertError(error.response.data.message);
							setLoading(false);
						});
				} else {
					showAlertError(
						"Vérifiez votre connexion et les champs, puis recommencez"
					);
					setLoading(false);
				}
			})
			.catch((error) => {
				showAlertError(error.response.data.message);
				setLoading(false);
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

	const getFournisseurs = () => {
		Axios.get(`/api/fournisseur/all`).then((response) => {
			if (response.status === 200) {
				LocalStorage.setItem(
					"fournisseursFromDb",
					JSON.stringify(res.data)
				);
				setFournisseursFromDb(response.data);
			}
		});
	};

	const ignorerCetteEtape = () => {
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
		fetch(`${Env.SERVER_URL}/api/customers/vague`, {
			method: "POST",
			crossDomain: true,
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				"Access-Control-Allow-Origin": "*",
				Authorization: `Bearer ${JSON.parse(
					LocalStorage.getItem("userToken")
				)}`,
			},
			body: JSON.stringify({
				titre,
				qte_animaux,
				prix_unitaire,
				fournisseur,
				fournisseurId,
				etat,
				enStock,
			}),
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.message) {
					showAlertSuccess(
						"Etape ignorée ...Création d'une vague par défaut"
					);
					//initialiser le vagueId pour les requette qui en aurons besoin
					fetch(`${Env.SERVER_URL}/api/customers/vague`, {
						headers: {
							Authorization: `Bearer ${JSON.parse(
								LocalStorage.getItem("userToken")
							)}`,
						},
					})
						.then((res) => {
							res.json().then((vagues) => {
								// LocalStorage.setItem(
								// 	"vagueId",
								// 	JSON.stringify(vagues[0]._id)
								// );
								//tout s'est bien derouler
								window.location.href = "../pages/vagues";
							});
						})
						.catch((error) => {
							showAlertError(error.response.data.message);
							setLoading(false);
						});
				} else {
					showAlertError(
						"Vérifiez votre connexion et les champs, puis recommencez"
					);
					setLoading(false);
				}
			})
			.catch((error) => {
				showAlertError(error.response.data.message);
				setLoading(false);
			});
	};

	return (
		<div>
			<SimpleNabar />

			<div className="container mt-5">
				<h1
					className="mt-2 text-center"
					style={{ fontFamily: "Ink Free" }}
				>
					Création de votre prémière vague.
				</h1>
				<form
					onSubmit={(event) => handleSubmit(event)}
					className="row g-3 bg-light mt-3 p-3"
					style={{ borderRadius: "20px" }}
				>
					<h4 className="text-primary text-center">
						Veuillez renseigner les informations pour la création la
						prémière vague.
					</h4>

					<div className="mt-5 row">
						<label className="col-sm-2 col-form-label">
							Titre de la vague{" "}
							<span style={{ fontWeight: "bold", color: "red" }}>
								*
							</span>
						</label>
						<div className="col-sm-9">
							<input
								required
								type="text"
								className="form-control"
								value={titre}
								placeholder="Donnez un titre à votre vague"
								title="Donnez un titre à votre vague"
								onChange={(e) => setTitre(e.target.value)}
							/>
						</div>
					</div>

					<div className="col-md-6">
						<label className="form-label">
							Nombre d'animaux{" "}
							<span style={{ fontWeight: "bold", color: "red" }}>
								*
							</span>
						</label>
						<div className="col-sm-10">
							<input
								required
								type="number"
								min={1}
								className="form-control"
								value={qte_animaux}
								placeholder="Entrez le nombre d'animaux acheté"
								title="Entrez le nombre d'animaux acheté"
								onChange={(e) => {
									setQteAnimaux(e.target.value);
									setEnStock(e.target.value);
								}}
							/>
						</div>
					</div>

					<div className="col-md-6">
						<label className="form-label">
							Prix unitaire d'un animal{" "}
							<span style={{ fontWeight: "bold", color: "red" }}>
								*
							</span>
						</label>
						<div className="col-sm-10">
							<input
								required
								type="number"
								min={1}
								className="form-control"
								value={prix_unitaire}
								placeholder="Entrez le prix d'un animal"
								title="Entrez le prix d'un animal"
								onChange={(e) =>
									setPrixUnitaire(e.target.value)
								}
							/>
						</div>
					</div>

					<div className="mb-3 mt-3 row">
						<label className="col-sm-2 col-form-label">
							Fournisseur
						</label>
						<div className="col-sm-9">
							<input
								type="text"
								className="form-control"
								value={fournisseur}
								placeholder="Entrez le nom du fournisseur"
								title="Entrez le nom du fournisseur"
								onChange={(event) => {
									autoCompleteFournisseur(event);
								}}
							/>
							{fournisseursList.length != 0 ? (
								<ul
									className="list-unstyled px-3  bg-gradient-secondary w-100"
									style={{
										height: "130px",
										overflow: "auto",
									}}
								>
									{fournisseursList.map((fournisseur) => {
										return (
											<li
												key={fournisseur._id}
												onClick={(e) => {
													setFournisseur(
														fournisseur.nom
													);
													setFournisseursList([]);
												}}
											>
												{fournisseur.nom} (
												{fournisseur.score})
											</li>
										);
									})}
								</ul>
							) : (
								""
							)}
						</div>
					</div>

					<div className="d-flex justify-content-center col-12 my-3">
						<button
							type="submit"
							className="btn btn-outline-primary px-5 py-3"
						>
							Confirmation
						</button>
					</div>
					<div className="text-end">
						<span
							onClick={() => ignorerCetteEtape()}
							className="text-danger brand-logo m-5"
							style={{ cursor: "pointer" }}
						>
							Ignorer
						</span>
					</div>
				</form>
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

export default FirstVague;

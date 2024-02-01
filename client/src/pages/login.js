import React, { useState, useEffect } from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Link,
	Navigate,
} from "react-router-dom";
import SimpleNabar from "../components/utils/simplenavbar";
import LocalStorage from "localStorage";
import Env from "../env";
import {
	Provider as AlertProvider,
	useAlert,
	positions,
	types,
	transitions,
} from "react-alert";
import ClipLoader from "react-spinners/ClipLoader";

function Login() {
	const [login, setLogin] = useState("");
	const [password, setPassword] = useState("");

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

	if (loggedIn() && !timeExprired()) {
		return <Navigate to={"/pages/vagues"} replace={true}></Navigate>;
	}

	const handleSubmit = (e) => {
		e.preventDefault();
		setLoading(true);
		if (login == "" || password == "") {
			showAlertError("Un champ est vide");
			setLoading(false);
		} else {
			fetch(`${Env.SERVER_URL}/api/auth/login`, {
				method: "POST",
				crossDomain: true,
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
					"Access-Control-Allow-Origin": "*",
				},
				body: JSON.stringify({
					login,
					password,
				}),
			})
				.then((res) => res.json())
				.then((data) => {
					if (data.status) {
						LocalStorage.setItem(
							"userToken",
							JSON.stringify(data.token)
						);
						LocalStorage.setItem(
							"userId",
							JSON.stringify(data.userId)
						);
						LocalStorage.setItem("_at", JSON.stringify(Date.now()));
						showAlertSuccess("Connexion réussie");
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
									if (vagues.length != 0) {
										// vagues.forEach((vague) => {
										// 	if (vague.etat == 1) {
										// 		LocalStorage.setItem(
										// 			"vagueId",
										// 			JSON.stringify(vague._id)
										// 		);
										// 	}
										// });
										// if (
										// 	!JSON.parse(
										// 		LocalStorage.getItem("vagueId")
										// 	)
										// ) {
										// 	LocalStorage.setItem(
										// 		"vagueId",
										// 		JSON.stringify(vagues[0]._id)
										// 	);
										// }
										//tout s'est bien derouler
										window.location.href = "./pages/vagues";
									} else {
										window.location.href = "./first-vague";
									}
								});
							})
							.catch((error) => {
								showAlertError(
									error.response.data.message
								);
								setLoading(false);
							});
					} else {
						showAlertError(data.message);
						setLoading(false);
					}
				})
				.catch((error) => {
					showAlertError(
						error.response.data.message
					);
					setLoading(false);
				});
		}
	};

	return (
		<div>
			<SimpleNabar />

			<div className="container col-12 mt-5 p-4">
				<h1
					className="mt-2 text-center"
					style={{ fontFamily: "Ink Free" }}
				>
					Bienvenue dans votre ferme
				</h1>
			</div>
			<div className="container mt-3 col-lg-6">
				<form
					onSubmit={(event) => handleSubmit(event)}
					className="bg-light mt-5 p-3"
					style={{
						borderRadius: "20px",
						padding: "50px !important",
					}}
				>
					<h4 className="text-primary text-center">
						Connectez vous à votre compte pour continuer votre
						projet
					</h4>

					<div className="row mb-3 mt-5">
						<label className="col-sm-12 col-form-label">
							Téléphone ou email :{" "}
							<span
								style={{
									fontWeight: "bold",
									color: "red",
								}}
							>
								*
							</span>
						</label>
						<div className="col-sm-12">
							<input
								type="text"
								className="form-control"
								style={{
									borderRadius: "20px",
									border: "none",
									borderBottom: "1px solid gray",
								}}
								placeholder="Entrer votre numéro de téléphone ou votre email..."
								title="Entrer votre numéro de téléphone ou votre email..."
								onChange={(e) => setLogin(e.target.value)}
								required
							/>
						</div>
					</div>

					<div className="mb-4 row">
						<label className="col-sm-12 col-form-label">
							Mot de passe :{" "}
							<span
								style={{
									fontWeight: "bold",
									color: "red",
								}}
							>
								*
							</span>
						</label>
						<div className="col-sm-12">
							<input
								type="password"
								className="form-control"
								style={{
									borderRadius: "20px",
									border: "none",
									borderBottom: "1px solid gray",
								}}
								placeholder="Entrer votre mot de passe..."
								title="Entrer votre mot de passe..."
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>
					</div>

					<div className="d-flex justify-content-center col-12 my-3">
						<button
							type={loading ? "button" : "submit"}
							className="btn btn-primary d-flex justify-content-center align-items-center"
							style={{ width: "135px", height: "45px" }}
						>
							{loading ? (
								<ClipLoader
									color={"#FFF"}
									loading={loading}
									size={35}
									aria-label="Loading Spinner"
									data-testid="loader"
								/>
							) : (
								"Login"
							)}
						</button>
					</div>
					<p className="forgot-password text-center">
						Vous n'avez pas encore de compte ?{" "}
						<Link to="/sign-up">Sign Up</Link>
					</p>
				</form>
			</div>
		</div>
	);
}
export default Login;

import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
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

function SignUp() {
	const [nom, setNom] = useState("");
	const [tel, setTel] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [passwordConfirmation, setPasswordConfirmation] = useState("");

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

	const handleSubmit = (e) => {
		e.preventDefault();
		setLoading(true);
		if (nom == "" || tel == "" || email == "" || password == "") {
			showAlertError("Un champ est vide");
			setLoading(false);
		} else if (password !== passwordConfirmation) {
			showAlertError("Confirmer le mot de passe");
			setLoading(false);
		} else {
			fetch(`${Env.SERVER_URL}/api/auth/signup`, {
				method: "POST",
				crossDomain: true,
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
					"Access-Control-Allow-Origin": "*",
				},
				body: JSON.stringify({
					nom,
					tel,
					email,
					password,
				}),
			})
				.then((res) => res.json())
				.then((data) => {
					if (data.status) {
						//une fois inscrit on le login direct
						fetch(`${Env.SERVER_URL}/api/auth/login`, {
							method: "POST",
							crossDomain: true,
							headers: {
								"Content-Type": "application/json",
								Accept: "application/json",
								"Access-Control-Allow-Origin": "*",
							},
							body: JSON.stringify({
								login: email,
								password: password,
							}),
						})
							.then((res) => res.json())
							.then((data) => {
								if (data.status) {
									LocalStorage.setItem(
										"userToken",
										JSON.stringify(data.token)
									),
										LocalStorage.setItem(
											"userId",
											JSON.stringify(data.userId)
										);
									LocalStorage.setItem(
										"_at",
										JSON.stringify(Date.now())
									);
									showAlertSuccess(
										"Compte créer avec succès"
									);
									window.location.href = "./first-vague";
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

			<div className="container col-12 mt-5 p-3">
				<h1
					className="mt-2 text-center"
					style={{ fontFamily: "Ink Free" }}
				>
					Bienvenue dans le système de gestion de votre ferme
				</h1>
			</div>
			<div className="container mt-3 col-lg-6">
				<form
					onSubmit={(event) => handleSubmit(event)}
					className="bg-light mt-3 p-3"
					style={{ borderRadius: "20px" }}
				>
					<h4 className="text-primary text-center">
						Créer votre compte pour débuter votre projet
					</h4>
					<div className="row mb-3 mt-5">
						<label className="col-sm-3 col-form-label">
							Nom :{" "}
							<span
								style={{
									fontWeight: "bold",
									color: "red",
								}}
							>
								*
							</span>
						</label>
						<div className="col-sm-9">
							<input
								type="text"
								className="form-control"
								style={{
									border: "none",
									borderRadius: "20px",
									borderBottom: "1px solid gray",
								}}
								placeholder="Votre nom complet..."
								onChange={(e) => setNom(e.target.value)}
								required
							/>
						</div>
					</div>
					<div className="row mb-3">
						<label className="col-sm-3 col-form-label">
							Téléphone :{" "}
							<span
								style={{
									fontWeight: "bold",
									color: "red",
								}}
							>
								*
							</span>
						</label>
						<div className="col-sm-9">
							<input
								type="number"
								min={1}
								className="form-control"
								style={{
									border: "none",
									borderRadius: "20px",
									borderBottom: "1px solid gray",
								}}
								placeholder="Votre numéro de téléphone..."
								onChange={(e) => setTel(e.target.value)}
								required
							/>
						</div>
					</div>
					<div className="row mb-3">
						<label className="col-sm-3 col-form-label">
							Email :{" "}
							<span
								style={{
									fontWeight: "bold",
									color: "red",
								}}
							>
								*
							</span>
						</label>
						<div className="col-sm-9">
							<input
								type="email"
								className="form-control"
								style={{
									border: "none",
									borderRadius: "20px",
									borderBottom: "1px solid gray",
								}}
								placeholder="Votre email valide..."
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>
					</div>
					<div className="row mb-3">
						<label className="col-sm-3 col-form-label">
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
						<div className="col-sm-9">
							<input
								type="password"
								className="form-control"
								style={{
									border: "none",
									borderRadius: "20px",
									borderBottom: "1px solid gray",
								}}
								placeholder="Entrer un mot de passe..."
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>
					</div>
					<div className="row mb-3">
						<label className="col-sm-3 col-form-label">
							Confirmer :{" "}
							<span
								style={{
									fontWeight: "bold",
									color: "red",
								}}
							>
								*
							</span>
						</label>
						<div className="col-sm-9">
							<input
								type="password"
								className="form-control"
								style={{
									border: "none",
									borderRadius: "20px",
									borderBottom: "1px solid gray",
								}}
								placeholder="Confirmer le mot de passe..."
								onChange={(e) =>
									setPasswordConfirmation(e.target.value)
								}
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
								"Sign Up"
							)}
						</button>
					</div>
					<p className="forgot-password text-center">
						Vous avez déja un compte ?{" "}
						<Link to="/sign-in">Login</Link>
					</p>
				</form>
			</div>
		</div>
	);
}

export default SignUp;

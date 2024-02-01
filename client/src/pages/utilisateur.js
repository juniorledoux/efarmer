import React, { useState, useEffect } from "react";
import "./profil.css";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Link,
	Navigate,
} from "react-router-dom";
import face28 from "../components/assets/images/faces/face28.jpg";
import NavBar from "../components/utils/navBar";
import LocalStorage from "localStorage";
import Popup from "reactjs-popup";
import Axios from "axios";
import {
	Provider as AlertProvider,
	useAlert,
	positions,
	types,
	transitions,
} from "react-alert";
import ClipLoader from "react-spinners/ClipLoader";

function Profil() {
	const [user, setUser] = useState({});
	const [userId, setUserId] = useState("");
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmNewPassword, setConfirmNewPassword] = useState("");
	const [vagueList, setVagueList] = useState(
		JSON.parse(LocalStorage.getItem("vagueList"))
			? JSON.parse(LocalStorage.getItem("vagueList"))
			: []
	);
	const [loading, setLoading] = useState(false);
	const Alert = useAlert();

	useEffect(() => {
		getProfilUser();
	}, []);

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

	//recuperer les infos du profil de l'utilisateur
	const getProfilUser = () => {
		setUser(JSON.parse(LocalStorage.getItem("profil")));
		setUserId(JSON.parse(LocalStorage.getItem("userId")));
	};

	//update le password
	const updatePassword = () => {
		setLoading(true);
		if (!currentPassword || !newPassword || !confirmNewPassword) {
			showAlertError("Un champ est vide");
			setLoading(false);
		} else if (newPassword !== confirmNewPassword) {
			showAlertError("Confirmer le nouveau mot de passe");
			setLoading(false);
		} else {
			Axios.put(`/api/auth/update_password/${userId}`, {
				currentPassword: currentPassword,
				newPassword: newPassword,
			})
				.then((response) => {
					if (response.status === 201) {
						showAlertSuccess(response.data.message);
						setLoading(false);
						setTimeout(() => {
							window.location.href = "./vagues";
						}, 4000);
					}
				})
				.catch((error) => {
					showAlertError(error.response.data.message);
					setLoading(false);
				});
		}
	};

	//supprimer le compte utilisateur
	const deleteAccount = () => {
		let password = prompt(
			"Si vous voulez supprimer votre compte tapez votre mot de passe"
		);
		setLoading(true);
		if (password) {
			Axios.delete(`/api/auth/delete_account/${userId}/${password}`)
				.then((response) => {
					if (response.status === 200) {
						showAlertSuccess(response.data.message);
						LocalStorage.clear();
						location.reload();
					}
				})
				.catch((error) => {
					showAlertError(error.response.data.message);
					setLoading(false);
				});
		}
	};

	return (
		<div className="profil">
			<NavBar vagueList={vagueList} funtionToUpdate={getProfilUser} />

			<div className="container">
				<div className="main-body">
					<nav aria-label="breadcrumb" className="main-breadcrumb">
						<ol className="breadcrumb mt-5">
							<li className="breadcrumb-item">
								<Link to="/">Acceuil</Link>
							</li>
							<li className="breadcrumb-item">
								<Link to="/pages/vagues">Liste des vagues</Link>
							</li>
							<li className="breadcrumb-item">
								<Link to="/pages/profil">
									Profil utilisateur
								</Link>
							</li>
						</ol>
					</nav>

					<div className="row gutters-sm">
						<div className="col-md-4 mb-3">
							<div className="card">
								<div className="card-body">
									<div className="d-flex flex-column align-items-center text-center">
										<img
											src={face28}
											alt="Admin"
											className="rounded-circle"
											width="150"
										/>
										<div className="mt-3">
											<h4 className="mt-3">{user.nom}</h4>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div className="col-md-8">
							<div className="card mb-3">
								<div className="card-body">
									<h3 className="text-primary mb-4">
										Mes infos
									</h3>
									<div className="row">
										<div className="col-sm-3">
											<h6 className="mb-0">
												Nom complet :
											</h6>
										</div>
										<div className="col-sm-9 text-primary">
											{user.nom}
										</div>
									</div>
									<hr />
									<div className="row">
										<div className="col-sm-3">
											<h6 className="mb-0">Email :</h6>
										</div>
										<div className="col-sm-9 text-primary">
											{user.email}
										</div>
									</div>
									<hr />
									<div className="row">
										<div className="col-sm-3">
											<h6 className="mb-0">
												Téléphone :
											</h6>
										</div>
										<div class="col-sm-9 text-primary">
											{user.tel}
										</div>
									</div>
									<hr />
									<div className="row">
										<div className="col-sm-12">
											<Link
												className="btn btn-outline-primary float-right"
												to="/pages/profil/edit"
											>
												Modifier
											</Link>
										</div>
									</div>
								</div>
							</div>

							<div className="">
								<div className="card mb-3">
									<div className="card-body">
										<h4 className="text-info float-left">
											Modifier mon mot de passe
										</h4>
										<div
											className="bg-light mt-4 p-3"
											style={{ borderRadius: "20px" }}
										>
											<div className="row mb-3">
												<div className="col-sm-12">
													<input
														required
														type="password"
														className="form-control"
														style={{
															borderRadius:
																"20px",
															border: "none",
															borderBottom:
																"1px solid gray",
														}}
														placeholder="Mot de passe actuel..."
														onChange={(e) =>
															setCurrentPassword(
																e.target.value
															)
														}
													/>
												</div>
											</div>

											<div className="row mb-3">
												<div className="col-sm-12">
													<input
														required
														type="password"
														className="form-control"
														style={{
															borderRadius:
																"20px",
															border: "none",
															borderBottom:
																"1px solid gray",
														}}
														placeholder="Nouveau mot de passe..."
														onChange={(e) =>
															setNewPassword(
																e.target.value
															)
														}
													/>
												</div>
											</div>

											<div className="row mb-3">
												<div className="col-sm-12">
													<input
														required
														type="password"
														className="form-control"
														style={{
															borderRadius:
																"20px",
															border: "none",
															borderBottom:
																"1px solid gray",
														}}
														placeholder="Confirmez le nouveau mot de passe..."
														onChange={(e) =>
															setConfirmNewPassword(
																e.target.value
															)
														}
													/>
												</div>
											</div>

											<div className="d-flex justify-content-end col-12">
												<button
													type="submit"
													className="btn btn-outline-info"
													onClick={() => {
														updatePassword();
													}}
												>
													Mettre à jour
												</button>
											</div>
										</div>
									</div>
								</div>
							</div>

							<div className="">
								<div className="card mb-3">
									<div className="card-body">
										<h4 className="text-danger float-left">
											Supprimer mon compte
										</h4>
										<Popup
											trigger={
												<button className="btn btn-outline-danger float-right btn-fw">
													{" "}
													<i class="tim-icons icon-trash-simple mx-2"></i>{" "}
												</button>
											}
											position="center top"
										>
											{(close) => (
												<div className="p-2">
													<p>
														Êtes-vous sur de vouloir
														supprimer votre compte ?
													</p>
													<button
														style={{
															marginLeft: "10px",
														}}
														className="btn btn-success"
														onClick={close}
													>
														Non
													</button>{" "}
													<button
														onClick={() => {
															deleteAccount();
														}}
														className="btn btn-outline-danger"
													>
														Oui
													</button>
												</div>
											)}
										</Popup>
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
export default Profil;

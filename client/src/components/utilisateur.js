import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import face28 from "../components/assets/images/faces/face28.jpg";
import NavBAr from "./utils/navBar";
import LocalStorage from "localStorage";
import Axios from "axios";
import {
	Provider as AlertProvider,
	useAlert,
	positions,
	types,
	transitions,
} from "react-alert";
import ClipLoader from "react-spinners/ClipLoader";

function UserProfilEdit() {
	const [profil, setProfil] = useState({});
	const [userId, setUserId] = useState("");
	const [nom, setNom] = useState("");
	const [tel, setTel] = useState("");
	const [email, setEmail] = useState("");
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
		getProfilUser();
		setNom(JSON.parse(LocalStorage.getItem("profil")).nom);
		setTel(JSON.parse(LocalStorage.getItem("profil")).tel);
		setEmail(JSON.parse(LocalStorage.getItem("profil")).email);
	}, []);

	//recuperer les infos du profil de l'utilisateur
	const getProfilUser = () => {
		setProfil(JSON.parse(LocalStorage.getItem("profil")));
		setUserId(JSON.parse(LocalStorage.getItem("userId")));
	};

	//update le profil
	const setUpdateUser = () => {
		setLoading(true);
		if (!email && !nom && !tel) {
			showAlertError("Aucune donnée à modifier");
			setLoading(false);
		} else {
			Axios.put(`/api/auth/update/${userId}`, {
				nom: nom,
				tel: tel,
				email: email,
			})
				.then((response) => {
					if (response.status === 201) {
						showAlertSuccess(response.data.message);
						setLoading(false);
						setTimeout(() => {
							window.location.href = "../vagues";
						}, 4000);
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
			<NavBAr
				vagueList={vagueList}
				setLoading={setLoading}
				funtionToUpdate={getProfilUser}
			/>

			<div className="container">
				<div className="main-body">
					<nav
						aria-label="breadcrumb"
						className="main-breadcrumb mt-5"
					>
						<ol className="breadcrumb">
							<li className="breadcrumb-item">
								<Link to="/">Acceuil</Link>
							</li>
							<li className="breadcrumb-item">
								<Link to="/pages/vagues">Liste des vagues</Link>
							</li>
							<li className="breadcrumb-item">
								<Link to="/pages/profil/">
									Profil utilisateur
								</Link>
							</li>
							<li className="breadcrumb-item">
								<Link to="/pages/profil/edit">
									Modifier le Profil
								</Link>
							</li>
						</ol>
					</nav>

					<div className="container1 rounded bg-white  mb-5">
						<div className="row">
							<div className="col-md-3 border-right">
								<div className="d-flex flex-column align-items-center text-center p-3 py-5">
									<img
										className="rounded-circle mt-5"
										width="150px"
										src={face28}
									/>
									<span className="font-weight-bold">
										{profil.nom}
									</span>
									<span className="text-black-50">
										{profil.email}
									</span>
								</div>
							</div>
							<div className="col-md-5 border-right">
								<div className="p-3 py-5">
									<div className="d-flex justify-content-center align-items-center mb-3">
										<h4 className="text-center text-success text-decoration-underline">
											Modifier les infos du profil
										</h4>
									</div>

									<div className="row mt-3">
										<div className="col-md-12">
											<label className="labels">
												Nom complet :
											</label>
											<input
												type="text"
												className="form-control"
												placeholder={profil.nom}
												onChange={(event) => {
													setNom(event.target.value);
												}}
											/>
										</div>
										<div className="col-md-12 mt-3">
											<label className="labels">
												Téléphone :
											</label>
											<input
												type="text"
												className="form-control"
												placeholder={profil.tel}
												onChange={(event) => {
													setTel(event.target.value);
												}}
											/>
										</div>

										<div className="col-md-12 mt-3">
											<label className="labels">
												Email :
											</label>
											<input
												type="text"
												className="form-control"
												placeholder={profil.email}
												onChange={(event) => {
													setEmail(
														event.target.value
													);
												}}
											/>
										</div>

										<div className="mt-5 text-center">
											<button
												className="btn btn-outline-success profile-button"
												type="button"
												onClick={() => {
													setUpdateUser();
												}}
											>
												Sauvegarder
											</button>
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
		</div>
	);
}
export default UserProfilEdit;

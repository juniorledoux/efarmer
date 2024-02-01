import React, { useState, useEffect } from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Link,
	Navigate,
} from "react-router-dom";
import NavBar from "../components/utils/navBar";
import "../components/dashboard.css";
import "reactjs-popup/dist/index.css";
import Axios from "axios";
import moment from "moment";
import Popup from "reactjs-popup";
import NumberFormat from "react-number-format";
import LocalStorage from "localStorage";
import {
	Provider as AlertProvider,
	useAlert,
	positions,
	types,
	transitions,
} from "react-alert";
import ClipLoader from "react-spinners/ClipLoader";
import { useParams } from "react-router-dom";
import { Input } from "reactstrap";

function PageFournisseur() {
	const { vagueId } = useParams();
	const [newNom, setNewNom] = useState("");
	const [fournisseurList, setFournisseurList] = useState(
		JSON.parse(LocalStorage.getItem("fournisseurList"))
			? JSON.parse(LocalStorage.getItem("fournisseurList"))
			: []
	);
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
		getFournisseurs();
		// getF();
	}, []);

	// const getF = () => {
	// 	let i = 0;
	// 	for (
	// 		let index = Date.parse(new Date().toDateString());
	// 		index <=
	// 		Date.parse(new Date().toDateString()) +
	// 			Date.parse(new Date(86400 * 1000).toDateString()) * 45;
	// 		index += Date.parse(new Date(86400 * 1000).toDateString())
	// 	) {
	// 		i++;
	// 		console.log(i);
	// 		console.log(new Date(index).toLocaleDateString());
	// 	}
	// };
	const getFournisseurs = () => {
		if (!fournisseurList || fournisseurList.length == 0) setLoading(true);
		Axios.get(`/api/fournisseur`)
			.then((response) => {
				setLoading(false);
				setFournisseurList(response.data);
				LocalStorage.setItem(
					"fournisseurList",
					JSON.stringify(response.data)
				);
			})
			.catch(() => {
				showAlertError("Problème de connexion :(");
				setLoading(false);
			});
	};

	const updateNomFournisseur = (id) => {
		setLoading(true);
		if (newNom == "") {
			showAlertError("Le champs ne doit pas être vide");
			setLoading(false);
		} else {
			Axios.put(`/api/fournisseur/${id}`, {
				nom: newNom,
			})
				.then((response) => {
					getFournisseurs();
					if (response.status === 201)
						showAlertSuccess(response.data.message);
					else showAlertError("Verifiez vos champs et recommencez");
					setLoading(false);
				})
				.catch((error) => {
					showAlertError("Problème de connexion :(");
					setLoading(false);
				});
		}
	};

	const deleteFournisseur = (id) => {
		setLoading(true);
		Axios.delete(`/api/fournisseur/${id}`)
			.then((response) => {
				getFournisseurs();
				if (response.status === 200)
					showAlertSuccess(response.data.message);
				else showAlertError("Verifiez vos champs et recommencez");
				setLoading(false);
			})
			.catch((error) => {
				showAlertError("Problème de connexion :(");
				setLoading(false);
			});
	};
	return (
		<div>
			<NavBar
				VAGUEID={vagueId}
				vagueList={vagueList}
				funtionToUpdate={getFournisseurs}
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
							<h2 className="text-center bg-dark rounded text-white p-2 col-lg-7 mt-2 mx-auto">
								Liste Des Fournisseurs
							</h2>
							<div
								style={{
									marginTop: "40px",
									marginBottom: "45px",
								}}
							>
								{/* <input
									type={"date"}
									onChange={(event) => {
										console.log(
											new Date(
												new Date(
													event.target.value
												).toDateString()
											).getTime()
										);
										console.log(
											new Date(
												new Date().toDateString()
											).getTime()+86400*1000*45
										);
									}}
								/> */}
								<div>
									<div
										className="table-responsive"
										style={{ width: "100%" }}
									>
										<table className="table table-striped">
											<thead>
												<tr>
													<th className="text-center">
														{" "}
														Nom{" "}
													</th>
													<th className="text-center">
														{" "}
														Type{" "}
													</th>
													<th className="text-center">
														Score
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
												{fournisseurList.length == 0 ? (
													<tr className="text-center text-danger m-auto">
														Vide
													</tr>
												) : (
													""
												)}
												{fournisseurList.map((val) => (
													<tr key={val._id}>
														<td className="text-center">
															{val.nom}
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
																				val.nom
																			}
																			value={
																				newNom
																			}
																			onChange={(
																				event
																			) => {
																				setNewNom(
																					event.target.value.toUpperCase()
																				);
																			}}
																			className="form-control"
																		/>
																		<button
																			className="btn btn-outline-success mt-2 btn-fw"
																			onClick={() => {
																				updateNomFournisseur(
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
															{val.type}
														</td>
														<td className="text-center">
															<NumberFormat
																value={
																	val.score
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
																suffix={" PTS"}
															/>
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
																			<i class="tim-icons icon-trash-simple mx-2"></i>{" "}
																		</a>
																	</div>
																}
																position="left center"
															>
																{(close) => (
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
																				deleteFournisseur(
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

export default PageFournisseur;

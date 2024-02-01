import React, { useState, useEffect } from "react";
import "../../components/assets/vendors/feather/feather.css";
import "../../components/assets/vendors/ti-icons/css/themify-icons.css";
import "../../components/assets/vendors/css/vendor.bundle.base.css";
import "../../components/assets/vendors/datatables.net-bs4/dataTables.bootstrap4.css";
import "../../components/assets/vendors/ti-icons/css/themify-icons.css";
import "../../components/assets/js/select.dataTables.min.css";
import "../../components/assets/css/vertical-layout-light/style.css";
import "../../components/assets/images/favicon.png";
import "../../components/dashboard.css";
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
import Popup from "reactjs-popup";
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

function VagueIndex() {
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

	const deleteVague = (id) => {
		setLoading(true);
		Axios.delete(`/api/customers/vague/${id}`)
			.then((response) => {
				if (response.status === 200) {
					showAlertSuccess(response.data.message);
					getVagues();
				} else {
					showAlertError("Veuillez recommencez");
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
		if (!vagueList || vagueList.length == 0) setLoading(true);
		Axios.get(`/api/customers/vague`)
			.then((res) => {
				setLoading(false);
				LocalStorage.setItem("vagueList", JSON.stringify(res.data));
				setVagueList(res.data);
			})
			.catch((error) => {
				setLoading(false);
				showAlertError(error.response.data.message);
			});
	};

	return (
		<div>
			<NavBar vagueList={vagueList} funtionToUpdate={getVagues} />

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
							<h2 className="text-center bg-gradient-primary rounded text-white p-2 col-lg-7 mt-2 mx-auto">
								Toutes Les Vagues
							</h2>
							<div
								style={{
									marginTop: "40px",
									marginBottom: "45px",
								}}
							>
								<button
									className={`btn bg-gradient-primary mx-2 my-2`}
									data-bs-target="#ajoutVague"
									data-bs-toggle="modal"
									data-bs-dismiss="modal"
									title="Ajouter une nouvelle vague"
								>
									<i class="tim-icons icon-simple-add text-white font-weight-bold"></i>
								</button>
								{vagueList.length == 0 ? (
									<h3 className="text-danger text-center">
										Aucune vague
									</h3>
								) : (
									""
								)}
								<div class="row row-cols-1 row-cols-md-3 g-4">
									{vagueList.map((val) => (
										<div class="col" key={val._id}>
											<Link
												to={`/pages/vagues/${val._id}`}
												class="card card-link-hover rounded shadow-lg text-decoration-none h-100 mb-3"
												style={{
													maxWidth: "20rem",
												}}
											>
												<div class="card-header text-center font-weight-bold">
													{val.titre}
												</div>
												<div class="card-body text-primary">
													<h5 class="card-title">
														{val.enStock == 0 ||
														val.enStock == 1 ? (
															<NumberFormat
																value={
																	val.enStock
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
																	" Sujet en stock"
																}
															/>
														) : (
															<NumberFormat
																value={
																	val.enStock
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
																	" Sujets en stock"
																}
															/>
														)}
													</h5>
													<p class="card-text font-weight-bold">
														{val.age_sujet == 0 ||
														val.age_sujet == 1 ? (
															<NumberFormat
																value={
																	val.age_sujet
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
																suffix={" Jour"}
															/>
														) : (
															<NumberFormat
																value={
																	val.age_sujet
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
													</p>
													<p
														className={`card-text ${
															val.etat == 2
																? "text-success font-weight-bold"
																: ""
														}`}
													>
														{val.date_arrive &&
														val.etat > 0
															? val.etat == 1
																? "Arrive en maturité le: " +
																  moment(
																		new Date(
																			Date.parse(
																				val.date_arrive
																			) +
																				86400 *
																					1000 *
																					45
																		)
																  ).format(
																		"DD/MM/YYYY"
																  )
																: "Stoppée le: " +
																  moment(
																		new Date(
																			val.stoppe_le
																		)
																  ).format(
																		"DD/MM/YYYY"
																  )
															: "Vague Non Démarrée"}
													</p>
												</div>

												{val.etat == 1 ? (
													<p class="card-text">
														<BarLoader
															color={"#E91E63"}
															loading={true}
															size={135}
															className="float-end w-100 rounded-bottom"
															aria-label="Loading Spinner"
															data-testid="loader"
														/>
													</p>
												) : (
													""
												)}
											</Link>
											<p
												class="position-absolute"
												style={{
													bottom: "-8px",
													right: "20px",
												}}
											>
												<Popup
													trigger={
														val.etat == 1 ? (
															""
														) : (
															<a
																className="text-danger"
																style={{
																	fontWeight:
																		"bold",
																}}
															>
																{" "}
																<i class="tim-icons p-2 fs-5 font-weight-bold icon-trash-simple mx-2"></i>{" "}
															</a>
														)
													}
													position="bottom center"
												>
													{(close) => (
														<div className="p-2">
															<p>
																Êtes-vous sur de
																vouloir
																supprimer ?
															</p>
															<button
																onClick={() => {
																	deleteVague(
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
																onClick={close}
															>
																Non
															</button>
														</div>
													)}
												</Popup>
											</p>
										</div>
									))}
								</div>
							</div>
						</div>
						<footer className="footer">
							<div className="d-sm-flex justify-content-center">
								<span className="text-muted text-center text-sm-left d-block d-sm-inline-block mb-5">
									Copyright © 2022. HD Corp Services All
									rights reserved.
								</span>
							</div>
						</footer>
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

			<script src="../../components/assets/vendors/js/vendor.bundle.base.js"></script>
			<script src="../../components/assets/vendors/chart.js/Chart.min.js"></script>
			<script src="../../components/assets/vendors/datatables.net/jquery.dataTables.js"></script>
			<script src="../../components/assets/vendors/datatables.net-bs4/dataTables.bootstrap4.js"></script>
			<script src="../../components/assets/js/dataTables.select.min.js"></script>
			<script src="../../components/assets/js/off-canvas.js"></script>
			<script src="../../components/assets/js/hoverable-collapse.js"></script>
			<script src="../../components/assets/js/template.js"></script>
			<script src="../../components/assets/js/settings.js"></script>
			<script src="../../components/assets/js/todolist.js"></script>
			<script src="../../components/assets/js/dashboard.js"></script>
			<script src="../../components/assets/js/Chart.roundedBarCharts.js"></script>
		</div>
	);
}

export default VagueIndex;

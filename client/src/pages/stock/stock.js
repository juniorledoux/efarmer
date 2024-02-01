import React, { useState, useEffect } from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Link,
	Navigate,
} from "react-router-dom";
import NavBar from "../../components/utils/navBar";
import LocalStorage from "localStorage";
import Popup from "reactjs-popup";
import moment from "moment";
import { useParams } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";
import NumberFormat from "react-number-format";
import Axios from "axios";
import { Bar } from "react-chartjs-2";
import {
	Provider as AlertProvider,
	useAlert,
	positions,
	types,
	transitions,
} from "react-alert";

function PageStock() {
	const { vagueId } = useParams();
	const [loading, setLoading] = useState(false);
	const [vagueList, setVagueList] = useState(
		JSON.parse(LocalStorage.getItem("vagueList"))
			? JSON.parse(LocalStorage.getItem("vagueList"))
			: []
	);
	const [vague, setVague] = useState({});
	const [stockList, setStockList] = useState(
		JSON.parse(LocalStorage.getItem("stockList")) &&
			JSON.parse(LocalStorage.getItem("stockList")).length != 0 &&
			JSON.parse(LocalStorage.getItem("stockList"))[0].vagueId == vagueId
			? JSON.parse(LocalStorage.getItem("stockList"))
			: []
	);

	const Alert = useAlert();
	const [chartData, setChartData] = useState({
		labels: [],
		datasets: [
			{
				label: "En stock ",
				data: [],
			},
		],
	});
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

	const getStock = () => {
		if (!stockList || stockList.length == 0) setLoading(true);
		Axios.get(`/api/stock/all/${vagueId}`)
			.then((response) => {
				setLoading(false);
				if (response.status === 200) {
					LocalStorage.setItem(
						"stockList",
						JSON.stringify(response.data)
					);
					setStockList(response.data);
				}
			})
			.catch((error) => {
				setLoading(false);
				showAlertError(error.response.data.message);
			});
	};

	const grouperStock = (stocks) => {
		let stockList = [];
		if (stocks.length < 16) {
			for (let index = 0; index < stocks.length; index += 3) {
				stockList.push({
					jour: "Jour " + (index + 1),
					quantite: Math.round(stocks[index].quantite),
					cummulPerte: Math.round(stocks[index].cummulPerte),
					cummulVente: Math.round(stocks[index].cummulVente),
				});
			}
		} else if (stocks.length >= 16 && stocks.length < 31) {
			for (let index = 0; index < stocks.length; index += 5) {
				stockList.push({
					jour: "Jour " + (index + 1),
					quantite: Math.round(stocks[index].quantite),
					cummulPerte: Math.round(stocks[index].cummulPerte),
					cummulVente: Math.round(stocks[index].cummulVente),
				});
			}
		} else if (stocks.length >= 31 && stocks.length < 43) {
			for (let index = 0; index < stocks.length; index += 7) {
				stockList.push({
					jour: "Jour " + (index + 1),
					quantite: Math.round(stocks[index].quantite),
					cummulPerte: Math.round(stocks[index].cummulPerte),
					cummulVente: Math.round(stocks[index].cummulVente),
				});
			}
		} else if (stocks.length >= 43 && stocks.length < 51) {
			for (let index = 0; index < stocks.length; index += 10) {
				stockList.push({
					jour: "Jour " + (index + 1),
					quantite: Math.round(stocks[index].quantite),
					cummulPerte: Math.round(stocks[index].cummulPerte),
					cummulVente: Math.round(stocks[index].cummulVente),
				});
			}
		} else if (stocks.length >= 51) {
			for (let index = 0; index < stocks.length; index += 20) {
				stockList.push({
					jour: "Jour " + (index + 1),
					quantite: Math.round(stocks[index].quantite),
					cummulPerte: Math.round(stocks[index].cummulPerte),
					cummulVente: Math.round(stocks[index].cummulVente),
				});
			}
		}
		if (stocks.length > 4) {
			let i = stocks.length - 1;
			stockList.push({
				jour: "Jour " + (i + 1),
				quantite: Math.round(stocks[i].quantite),
				cummulPerte: Math.round(stocks[i].cummulPerte),
				cummulVente: Math.round(stocks[i].cummulVente),
			});
		}
		return stockList;
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

	useEffect(() => {
		getStock();
	}, []);

	useEffect(() => {
		setChartData({
			labels: grouperStock(stockList).map((stock) => stock.jour),
			datasets: [
				{
					label: "Stock du jour ",
					data: grouperStock(stockList).map(
						(stock) => stock.quantite
					),
					backgroundColor: "#248AFD",
				},
				{
					label: "Cummul des décès à ce jour ",
					data: grouperStock(stockList).map(
						(stock) => stock.cummulPerte
					),
					backgroundColor: "#E91E63",
				},
				{
					label: "Cummul des ventes à ce jour ",
					data: grouperStock(stockList).map(
						(stock) => stock.cummulVente
					),
					backgroundColor: "#57B657",
				},
			],
		});
	}, [stockList]);

	useEffect(() => {
		getVague(vagueList);
	}, [stockList]);

	const sommeTotalPerte = (id) => {
		let somme = 0;
		stockList.forEach((perte) => {
			somme += perte.valeur_perdu;
		});
		return somme;
	};

	return (
		<div>
			<NavBar
				VAGUEID={vagueId}
				vagueList={vagueList}
				funtionToUpdate={getStock}
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
								to={`/pages/vagues/${vagueId}`}
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
							<h2 className="text-center bg-gradient-info rounded text-white p-2 col-lg-7 mt-2 mx-auto">
								Evolution du stock
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
											<div className="row">
												<div className="col-lg-3">
													<h5 class="card-category">
														Stock initial
													</h5>
													<h3 class="card-title">
														<i class="tim-icons icon-app text-primary"></i>{" "}
														<NumberFormat
															value={
																vague.qte_animaux
																	? vague.qte_animaux
																	: 0
															}
															displayType={"text"}
															thousandSeparator={
																true
															}
															decimalScale={true}
															suffix={" Sujets"}
														/>
													</h3>
												</div>
												<div className="col-lg-3">
													<h5 class="card-category">
														Stock actuel
													</h5>
													<h3 class="card-title">
														<i class="tim-icons icon-bank text-danger"></i>{" "}
														<NumberFormat
															value={
																vague.enStock
																	? vague.enStock
																	: 0
															}
															displayType={"text"}
															thousandSeparator={
																true
															}
															decimalScale={true}
															suffix={" Sujets"}
														/>
													</h3>
												</div>
												<div className="col-lg-3">
													<h5 class="card-category">
														Décès
													</h5>
													<h3 class="card-title">
														<i class="tim-icons icon-sound-wave text-danger"></i>{" "}
														<span className="font-weight-bold">
															<NumberFormat
																value={
																	vague.animaux_perdu
																		? vague.animaux_perdu
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
																	" Sujets"
																}
															/>{" "}
															(
															<NumberFormat
																value={
																	vague.animaux_perdu
																		? (vague.animaux_perdu *
																				100) /
																		  vague.qte_animaux
																		: 0
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
																suffix={" %"}
															/>
															)
														</span>
													</h3>
												</div>
												<div className="col-lg-3">
													<h5 class="card-category">
														Ventes
													</h5>
													<h3 class="card-title">
														<i class="tim-icons icon-sound-wave text-success"></i>{" "}
														<span className="font-weight-bold">
															<NumberFormat
																value={
																	vague.NbreSujet_vendu
																		? vague.NbreSujet_vendu
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
																	" Sujets"
																}
															/>{" "}
															(
															<NumberFormat
																value={
																	vague.NbreSujet_vendu
																		? (vague.NbreSujet_vendu *
																				100) /
																		  vague.qte_animaux
																		: 0
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
																suffix={" %"}
															/>
															)
														</span>
													</h3>
												</div>
											</div>
										</div>
										<div class="card-body">
											<div class="chart-area">
												<Bar
													data={chartData}
													height={
														window.outerWidth < 500
															? "500px"
															: "auto"
													}
													options={{
														plugins: {
															title: {
																display: true,
																text: "Evolution du stock",
															},
															legend: {
																display: true,
															},
														},
														interaction: {
															intersect: false,
														},
														scales: {
															x: {
																stacked: true,
															},
															y: {
																stacked: true,
															},
														},
													}}
												/>
											</div>
										</div>
									</div>

									<div
										className="table-responsive"
										style={{ width: "100%" }}
									></div>
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
	);
}

export default PageStock;

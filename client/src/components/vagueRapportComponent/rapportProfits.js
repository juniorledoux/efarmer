import React, { useState, useEffect } from "react";
import Axios from "axios";
import moment from "moment";
import Popup from "reactjs-popup";
import { Line } from "react-chartjs-2";
import Chart from "chart.js/auto";
import bootstrap from "bootstrap";
import "reactjs-popup/dist/index.css";
import "../../components/assets/css/nucleo-icons.css";
import { Link } from "react-router-dom";
import NumberFormat from "react-number-format";
import LocalStorage from "localStorage";

function RapportRevenus({ vagueId, setLoading }) {
	const [profitsForRapportList, setProfitsForRappotList] = useState(
		JSON.parse(LocalStorage.getItem("profitsForRapportList")) &&
			JSON.parse(LocalStorage.getItem("profitsForRapportList")).length !=
				0
			? JSON.parse(LocalStorage.getItem("profitsForRapportList"))
			: []
	);
	const [profitsList, setProfitsList] = useState(
		JSON.parse(LocalStorage.getItem("profitsList")) &&
			JSON.parse(LocalStorage.getItem("profitsList")).length != 0
			? JSON.parse(LocalStorage.getItem("profitsList"))
			: []
	);

	const [chartData, setChartData] = useState({
		labels: [],
		datasets: [
			{
				label: "Profit de ",
				data: [],
				borderColor: "#e44cc4",
				borderWidth: 1,
			},
		],
	});

	useEffect(() => {
		getProfitsForRapport();
		getProfits();
	}, []);

	useEffect(() => {
		setChartData({
			labels: profitsForRapportList.map((profit) =>
				new Date(profit.titre).toLocaleDateString()
			),
			datasets: [
				{
					label: "Profit de ",
					data: profitsForRapportList.map((profit) => profit.montant),
					borderColor: "#e44cc4",
					borderWidth: 1,
					backgroundColor: profitsForRapportList.map((profit) =>
						profit.vagueId == vagueId ? "red" : "#248AFD"
					),
					lineTension: 0.5,
				},
			],
		});
	}, [vagueId, profitsForRapportList, profitsList]);

	const getProfitsForRapport = () => {
		if (!profitsForRapportList || profitsForRapportList.length == 0)
			setLoading(true);
		Axios.get(`/api/profits/rapport`)
			.then((response) => {
				setLoading(false);
				if (response.status === 200) {
					setProfitsForRappotList(response.data);
					LocalStorage.setItem(
						"profitsForRapportList",
						JSON.stringify(response.data)
					);
				}
			})
			.catch((error) => {
				setLoading(false);
				showAlertError(error.response.data.message);
			});
	};
	const getProfits = () => {
		Axios.get(`/api/profits`).then((response) => {
			if (response.status === 200) {
				setProfitsList(response.data);
				LocalStorage.setItem(
					"profitsList",
					JSON.stringify(response.data)
				);
			}
		});
	};

	const showMontant = () => {
		let montant = 0;
		profitsForRapportList.forEach((profit) => {
			if (profit.vagueId == vagueId) {
				montant = profit.montant;
			}
		});
		return montant;
	};

	return (
		<div class="card card-chart mb-3">
			<div class="card-header">
				<h5 class="card-category">Profit Vague Actuelle</h5>
				<h3 class="card-title">
					<i
						class="tim-icons icon-trophy"
						style={{
							color: "#e44cc4",
						}}
					></i>{" "}
					<NumberFormat
						value={showMontant()}
						displayType={"text"}
						thousandSeparator={true}
						decimalScale={true}
						suffix={" XAF"}
					/>
				</h3>
			</div>
			<div class="card-body">
				<div class="chart-area">
					<Line
						data={chartData}
						height={window.outerWidth < 500 ? "500px" : "auto"}
						options={{
							plugins: {
								title: {
									display: true,
									text: "Profits sur les ventes déja réalisées des différentes vagues",
								},
								legend: {
									display: true,
								},
							},
						}}
					/>
				</div>
			</div>
			<div className="">
				<div class="accordion accordion-flush" id="profitRapport">
					<div class="accordion-item">
						<h2
							class="accordion-header"
							id="flush-profitsForRapportLabel"
						>
							<button
								class="accordion-button collapsed"
								type="button"
								data-bs-toggle="collapse"
								data-bs-target="#flush-profitRapport"
								aria-expanded="false"
								aria-controls="flush-profitRapport"
							>
								Voir les profits de toutes les vagues
							</button>
						</h2>
						<div
							id="flush-profitRapport"
							class="accordion-collapse collapse"
							aria-labelledby="flush-profitsForRapportLabel"
							data-bs-parent="#profitRapport"
						>
							<div
								class="accordion-body"
								style={{ height: "200px", overflow: "auto" }}
							>
								<table className="table table-striped">
									<tbody>
										{profitsList.length == 0 ? (
											<tr className="text-center text-danger m-auto">
												Vide
											</tr>
										) : (
											""
										)}
										{profitsList.map((profit, index) => (
											<tr key={index}>
												<td
													className={`${
														profit.vagueId ==
														vagueId
															? "text-info"
															: ""
													}`}
												>
													{" "}
													{profit.titre}{" "}
												</td>
												<td
													className={`text-center ${
														profit.montant <= 0
															? "text-danger"
															: "text-success"
													}`}
												>
													{" "}
													<NumberFormat
														value={profit.montant}
														displayType={"text"}
														thousandSeparator={true}
														decimalScale={true}
														suffix={" XAF"}
													/>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default RapportRevenus;

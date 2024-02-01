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

function RapportVaguePerte({ rapportVague, vagueId }) {
	const [perteOrdonnerList, setPerteOrdonnerList] = useState(
		JSON.parse(LocalStorage.getItem("perteOrdonnerList")) &&
			JSON.parse(LocalStorage.getItem("perteOrdonnerList")).length != 0 &&
			JSON.parse(LocalStorage.getItem("perteOrdonnerList"))[0].vagueId ==
				vagueId
			? JSON.parse(LocalStorage.getItem("perteOrdonnerList"))
			: []
	);
	const [perteList, setPerteList] = useState(
		JSON.parse(LocalStorage.getItem("perteList")) &&
			JSON.parse(LocalStorage.getItem("perteList")).length != 0 &&
			JSON.parse(LocalStorage.getItem("perteList"))[0].vagueId == vagueId
			? JSON.parse(LocalStorage.getItem("perteList"))
			: []
	);

	const [chartData, setChartData] = useState({
		labels: [],
		datasets: [
			{
				label: "Montant Perdu ",
				data: [],
				borderColor: "#E91E30",
				borderWidth: 1,
			},
		],
	});

	useEffect(() => {
		getPertes();
		console.log(perteList);
	}, []);
	useEffect(() => {
		setChartData({
			labels: perteOrdonnerList.map((perte) =>
				new Date(perte.date_perte).toLocaleDateString()
			),
			datasets: [
				{
					label: "Montant Perdu ",
					data: perteOrdonnerList.map((perte) =>
						Math.round(perte.valeur_perdu)
					),
					borderColor: "#E91E30",
					backgroundColor: "#248AFD",
					borderWidth: 1,
					lineTension: 0.5,
				},
			],
		});
	}, [vagueId, perteOrdonnerList, rapportVague]);

	const getPertes = () => {
		Axios.get(`/api/perte/all/${vagueId}`).then((response) => {
			LocalStorage.setItem(
				"perteList",
				JSON.stringify(response.data.pertes)
			);
			LocalStorage.setItem(
				"perteOrdonnerList",
				JSON.stringify(response.data.perteOrdonner)
			);
			setPerteOrdonnerList(response.data.perteOrdonner);
			setPerteList(response.data.pertes);
		});
	};

	return (
		<div class="card card-chart mb-3">
			<div class="card-header">
				<h5 class="card-category">Total Pertes</h5>
				<h3 class="card-title">
					<i class="tim-icons icon-send text-danger"></i>{" "}
					<NumberFormat
						value={
							rapportVague.total_pertes
								? rapportVague.total_pertes
								: 0
						}
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
									text: "Statistiques des montants des pertes",
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
				<div
					class="accordion accordion-flush"
					id="accordionFlushExampl3"
				>
					<div class="accordion-item">
						<h2 class="accordion-header" id="flush-headingThree">
							<button
								class="accordion-button collapsed"
								type="button"
								data-bs-toggle="collapse"
								data-bs-target="#flush-collapseThree"
								aria-expanded="false"
								aria-controls="flush-collapseThree"
							>
								Quantité Totale Perdue:{" "}
								<strong className="text-danger mx-1">
									<NumberFormat
										value={
											rapportVague.total_quantite_pertes
												? rapportVague.total_quantite_pertes
												: 0
										}
										displayType={"text"}
										thousandSeparator={true}
										decimalScale={true}
										suffix={" Sujets"}
									/>
								</strong>
							</button>
						</h2>
						<div
							id="flush-collapseThree"
							class="accordion-collapse collapse"
							aria-labelledby="flush-headingThree"
							data-bs-parent="#accordionFlushExampl3"
						>
							<div
								class="accordion-body"
								style={{ height: "200px", overflow: "auto" }}
							>
								<table className="table table-striped">
									<tbody>
										{perteList.length == 0 ? (
											<tr className="text-center text-danger m-auto">
												Vide
											</tr>
										) : (
											""
										)}
										{perteList.map((perte) => (
											<tr key={perte._id}>
												<td className="text-center">
													{" "}
													<NumberFormat
														value={perte.qte_perdu}
														displayType={"text"}
														thousandSeparator={true}
														decimalScale={true}
														suffix={""}
													/>{" "}
													X{" "}
													<NumberFormat
														value={Math.round(
															perte.valeur_perdu /
																perte.qte_perdu
														)}
														displayType={"text"}
														thousandSeparator={true}
														decimalScale={true}
														suffix={" XAF"}
													/>
												</td>
												<td className="text-center">
													{moment(
														new Date(
															perte.date_perte
														)
													).format("DD/MM/YYYY")}
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

export default RapportVaguePerte;

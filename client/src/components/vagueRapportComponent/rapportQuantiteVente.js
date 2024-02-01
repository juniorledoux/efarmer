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

function RapportVagueQuantiteVente({ rapportVague, vagueId, allVenteList }) {
	const [venteList, setVenteList] = useState(allVenteList);
	const [venteGrouperList, setVenteGrouperList] = useState([]);

	const [chartData, setChartData] = useState({
		labels: [],
		datasets: [
			{
				label: "Quantité Vendue ",
				data: [],
				borderColor: "#248AFD",
				borderWidth: 1,
			},
		],
	});

	useEffect(() => {
		setVenteList(allVenteList);
		setVenteGrouperList(
			ordreDecroissant(comptabiliser(groupByAcheteurName(allVenteList)))
		);
		// getVentes();
	}, []);
	useEffect(() => {
		setChartData({
			labels: venteList.map((vente) => vente.acheteur),
			datasets: [
				{
					label: "Quantité Vendue ",
					data: venteList.map((vente) => vente.qte_vendu),
					borderColor: "#248AFD",
					backgroundColor: "red",
					borderWidth: 1,
					lineTension: 0.5,
				},
			],
		});
	}, [vagueId, venteList, rapportVague]);

	// const getVentes = () => {
	// 	Axios.get(`/api/vente/all/${vagueId}`).then((response) => {
	// 		if (response.status === 200) {
	// 			LocalStorage.setItem(
	// 				"venteList",
	// 				JSON.stringify(response.data.ventes)
	// 			);
	// 			setVenteGrouperList(
	// 				ordreDecroissant(
	// 					comptabiliser(groupByAcheteurName(response.data.ventes))
	// 				)
	// 			);
	// 		}
	// 	});
	// };

	const groupByAcheteurName = (ventes) => {
		const hash = Object.create(null);
		let result = [];
		ventes.forEach((vente) => {
			if (!hash[vente.acheteur.toUpperCase()]) {
				hash[vente.acheteur.toUpperCase()] = [];
				result.push(hash[vente.acheteur.toUpperCase()]);
			}
			hash[vente.acheteur.toUpperCase()].push(vente);
		});
		return result;
	};

	const comptabiliser = (ventesGroupe) => {
		let result = [];
		ventesGroupe.forEach((groupe) => {
			let quantiteTotal = 0;
			groupe.forEach((vente) => {
				quantiteTotal += vente.qte_vendu;
			});
			result.push({
				acheteur: groupe[0].acheteur,
				quantiteTotale: quantiteTotal,
			});
		});
		return result;
	};

	const ordreDecroissant = (ventesComptabiliser) => {
		ventesComptabiliser.sort((a, b) => b.quantiteTotale - a.quantiteTotale);
		return ventesComptabiliser;
	};

	return (
		<div class="card card-chart mb-3">
			<div class="card-header">
				<h5 class="card-category">Total Quantités Vendues</h5>
				<h3 class="card-title">
					<i class="tim-icons icon-cart text-info"></i>{" "}
					<NumberFormat
						value={rapportVague.total_quantite_ventes}
						displayType={"text"}
						thousandSeparator={true}
						decimalScale={true}
						suffix={" Sujets"}
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
									text: "Statistiques des acheteurs",
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
					id="accordionFlushExample"
				>
					<div class="accordion-item">
						<h2 class="accordion-header" id="flush-headingOne">
							<button
								class="accordion-button collapsed"
								type="button"
								data-bs-toggle="collapse"
								data-bs-target="#flush-collapseOne"
								aria-expanded="false"
								aria-controls="flush-collapseOne"
							>
								Voir les détails
							</button>
						</h2>
						<div
							id="flush-collapseOne"
							class="accordion-collapse collapse"
							aria-labelledby="flush-headingOne"
							data-bs-parent="#accordionFlushExample"
						>
							<div
								class="accordion-body"
								style={{ height: "200px", overflow: "auto" }}
							>
								<table className="table table-striped">
									<tbody>
										{venteGrouperList.length == 0 ? (
											<tr className="text-center text-danger m-auto">
												Vide
											</tr>
										) : (
											""
										)}
										{venteGrouperList.map(
											(vente, index) => (
												<tr key={index}>
													<td className="text-center">
														{vente.acheteur}
													</td>

													<td className="text-center">
														{" "}
														<NumberFormat
															value={
																vente.quantiteTotale
															}
															displayType={"text"}
															thousandSeparator={
																true
															}
															decimalScale={true}
															suffix={" Sujets"}
														/>
													</td>
												</tr>
											)
										)}
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

export default RapportVagueQuantiteVente;

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

function RapportVagueVente({ rapportVague, vagueId, allVenteList }) {
	const [venteList, setVenteList] = useState([]);
	const [venteGrouperList, setVenteGrouperList] = useState([]);

	const [chartData, setChartData] = useState({
		labels: [],
		datasets: [
			{
				label: "Montant Vendu ",
				data: [],
				borderColor: "#57B657",
				borderWidth: 1,
			},
		],
	});

	useEffect(() => {
		setVenteList(ordreCroissant(allVenteList));
		setVenteGrouperList(
			ordreDecroissant(comptabiliser(groupByAcheteurName(allVenteList)))
		);
		// getVentes();
	}, []);

	useEffect(() => {
		setChartData({
			labels: venteList.map((vente) =>
				new Date(vente.date_vente).toLocaleDateString()
			),
			datasets: [
				{
					label: "Montant Vendu ",
					data: venteList.map((vente) => vente.prix_vente),
					borderColor: "#57B657",
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
	// 			setVenteList(ordreCroissant(response.data.ventes));
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
			let sommeTotal = 0;
			groupe.forEach((vente) => {
				if (vente.mode_payement == "Immédiat") {
					sommeTotal += vente.prix_vente;
				} else {
					sommeTotal += vente.montant_avance;
				}
			});
			result.push({
				acheteur: groupe[0].acheteur,
				sommeTotale: sommeTotal,
			});
		});
		return result;
	};

	const ordreDecroissant = (ventesComptabiliser) => {
		ventesComptabiliser.sort((a, b) => b.sommeTotale - a.sommeTotale);
		return ventesComptabiliser;
	};
	const ordreCroissant = (ventes) => {
		ventes.sort((a, b) => new Date(a.date_vente) - new Date(b.date_vente));
		return ventes;
	};

	return (
		<div class="card card-chart mb-3">
			<div class="card-header">
				<h5 class="card-category">Total Ventes</h5>
				<h3 class="card-title">
					<i class="tim-icons icon-coins text-success"></i>{" "}
					<NumberFormat
						value={rapportVague.total_ventes}
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
									text: "Statistiques des montants des ventes",
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
					id="ccordionFlushExample2"
				>
					<div class="accordion-item">
						<h2 class="accordion-header" id="flush-headingTwo">
							<button
								class="accordion-button collapsed"
								type="button"
								data-bs-toggle="collapse"
								data-bs-target="#flush-collapseTwo"
								aria-expanded="false"
								aria-controls="flush-collapseTwo"
							>
								Voir les détails
							</button>
						</h2>
						<div
							id="flush-collapseTwo"
							class="accordion-collapse collapse"
							aria-labelledby="flush-headingTwo"
							data-bs-parent="#ccordionFlushExample2"
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
														{" "}
														{vente.acheteur}{" "}
													</td>
													<td className="text-center">
														{" "}
														<NumberFormat
															value={
																vente.sommeTotale
															}
															displayType={"text"}
															thousandSeparator={
																true
															}
															decimalScale={true}
															suffix={" XAF"}
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

export default RapportVagueVente;

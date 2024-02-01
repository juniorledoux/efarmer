import React, { useState, useEffect } from "react";
import Axios from "axios";
import moment from "moment";
import Popup from "reactjs-popup";
import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";
import bootstrap from "bootstrap";
import "reactjs-popup/dist/index.css";
import "../../components/assets/css/nucleo-icons.css";
import { Link } from "react-router-dom";
import NumberFormat from "react-number-format";
import LocalStorage from "localStorage";

function RapportVagueModeEncaissementVente({
	rapportVague,
	vagueId,
	allVenteList,
}) {
	const [venteList, setVenteList] = useState([]);

	const [chartData, setChartData] = useState({
		labels: [],
		datasets: [
			{
				label: "Montant encaissé ",
				data: [],
			},
		],
	});

	useEffect(() => {
		setVenteList(comptabiliser(groupByModeEncaissement(allVenteList)));
		// getVentes();
	}, []);

	useEffect(() => {
		setChartData({
			labels: venteList.map((vente) => vente.mode_encaissement),
			datasets: [
				{
					label: "Montant encaissé ",
					data: venteList.map((vente) => vente.sommeTotale),
					backgroundColor: ["#248AFD", "#E91E63", "#57B657"],
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
	// 			setVenteList(
	// 				comptabiliser(groupByModeEncaissement(response.data.ventes))
	// 			);
	// 		}
	// 	});
	// };

	const groupByModeEncaissement = (ventes) => {
		const hash = Object.create(null);
		let result = [];
		ventes.forEach((vente) => {
			if (!hash[vente.mode_encaissement]) {
				hash[vente.mode_encaissement] = [];
				result.push(hash[vente.mode_encaissement]);
			}
			hash[vente.mode_encaissement].push(vente);
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
				mode_encaissement: groupe[0].mode_encaissement,
				sommeTotale: sommeTotal,
			});
		});
		return result;
	};

	return (
		<div class="card card-chart mb-3">
			<div class="card-header">
				<h3 class="card-title">
					<i class="tim-icons icon-bag-16 text-primary"></i>{" "}
					<span class="font-weight-bold">Modes d'encaissement</span>
				</h3>
			</div>
			<div class="card-body">
				<div class="chart-area">
					<Bar
						data={chartData}
						height={window.outerWidth < 500 ? "500px" : "auto"}
						options={{
							plugins: {
								title: {
									display: true,
									text: "Statistiques des modes d'encaissement des ventes",
								},
								legend: {
									display: true,
								},
							},
						}}
					/>
				</div>
			</div>
		</div>
	);
}

export default RapportVagueModeEncaissementVente;

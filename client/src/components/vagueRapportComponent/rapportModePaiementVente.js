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

function RapportVagueModePaiementVente({
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
		setVenteList(comptabiliser(groupByModePaiement(allVenteList)));
		// getVentes();
	}, []);

	useEffect(() => {
		setChartData({
			labels: venteList.map((vente) => vente.mode_payement),
			datasets: [
				{
					label: "Montant encaissé ",
					data: venteList.map((vente) => vente.sommeTotale),
					backgroundColor: ["#57B657", "#FFC100"],
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
	// 				comptabiliser(groupByModePaiement(response.data.ventes))
	// 			);
	// 		}
	// 	});
	// };

	const groupByModePaiement = (ventes) => {
		const hash = Object.create(null);
		let result = [];
		ventes.forEach((vente) => {
			if (!hash[vente.mode_payement]) {
				hash[vente.mode_payement] = [];
				result.push(hash[vente.mode_payement]);
			}
			hash[vente.mode_payement].push(vente);
		});
		return result;
	};

	const comptabiliser = (ventesGroupe) => {
		let result = [];
		ventesGroupe.forEach((groupe) => {
			let sommeTotal = 0;
			groupe.forEach((vente) => {
				sommeTotal += vente.prix_vente;
			});
			result.push({
				mode_payement: groupe[0].mode_payement,
				sommeTotale: sommeTotal,
			});
		});
		return result;
	};

	return (
		<div class="card card-chart mb-3">
			<div class="card-header">
				<h3 class="card-title">
					<i class="tim-icons icon-money-coins text-warning"></i>{" "}
					<span class="font-weight-bold">Modes de paiement</span>
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
									text: "Statistiques des modes de paiement des ventes",
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

export default RapportVagueModePaiementVente;

import React, { useState, useEffect } from "react";
import NumberFormat from "react-number-format";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import LocalStorage from "localStorage";
import Axios from "axios";

//---------------------------Recupération de la somme des couts d'achat et de transport de la table vague pour un user et une vague
function InfosFerme(props) {
	const [vagueId, setVagueId] = useState(
		JSON.parse(LocalStorage.getItem("vagueId"))
	);
	const [temperature, setTemperature] = useState("");
	const [vague, setVague] = useState({});

	useEffect(() => {
		getVague(vagueId);
	}, []);

	//recuperer le prix et transport des vague de la vague en session
	const getVague = (vagueId) => {
		Axios.get(`api/customers/vague/${vagueId}`).then((res) => {
			if (res.status === 200) {
				setVague(res.data);
				getMeteo();
			}
		});
	};

	//recuperer les infos de la meteo sur la localisation de la vague
	const getMeteo = () => {
		const localisation = "douala";
		const tokenApiMeteo = "3c21732a5719e1ca403ed32af3da0d86";
		fetch(
			`http://api.weatherstack.com/current?access_key=${tokenApiMeteo}&query=${localisation}`
		).then((response) => {
			response.json().then((data) => {
				console.log(data);
				if (response.status === 200) {
					setTemperature(data.current.temperature);
				}
			});
		});
	};

	return (
		<div className="d-flex">
			<div>
				<h2 className="mb-0 font-weight-normal">
					<i className="icon-sun mr-2"></i>
					{temperature}
					<sup>35°C</sup>
				</h2>
			</div>
			<div className="ml-2">
				<p style={{ fontSize: "15px" }}>Vague selectionnée : </p>
				<h4 className="location font-weight-bold">{vague.titre}</h4>
				{/* <h6 className="font-weight-normal">{vague.localisation}</h6> */}
			</div>
		</div>
	);
}

export default InfosFerme;

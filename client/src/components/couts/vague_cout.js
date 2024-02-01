import React, { useState, useEffect } from "react";
import NumberFormat from "react-number-format";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import LocalStorage from "localStorage";
import Axios from "axios";

//---------------------------Recupération de la somme des couts d'achat et de transport de la table vague pour un user et une vague
function VagueCout(props) {
	const [vagueId, setVagueId] = useState(props.vagueId);
	const [sujet, setSujet] = useState({});
	const [vagueList, setVagueList] = useState(
		JSON.parse(LocalStorage.getItem("vagueList"))
			? JSON.parse(LocalStorage.getItem("vagueList"))
			: []
	);
	const [vagueActuelle, setVagueActuelle] = useState({});
	useEffect(() => {
		getVague(vagueList);
		getSujetPrix(vagueId);
	}, []);
	useEffect(() => {
		getSujetPrix(vagueId);
	}, [props.depenseActu, vagueActuelle]);

	//recuperer le prix_animaux et transport des vague de la vague en session
	const getSujetPrix = (vagueId) => {
		Axios.get(`api/cout/vague/${vagueId}`).then((res) => {
			if (res.status === 200) {
				setSujet(res.data);
			}
		});
	};
	const getVague = (vagueList) => {
		let v = {};
		vagueList.forEach((vague) => {
			if (vague._id == vagueId) {
				v = vague;
			}
		});
		setVagueActuelle(v);
	};

	const setProgressBar = () => {
		let budget_animaux =
			vagueActuelle.budget_animaux == 0
				? 1
				: vagueActuelle.budget_animaux;
		let progressbar =
			((sujet.prix_animaux + sujet.transport) * 100) / budget_animaux;
		return progressbar;
	};

	return (
		<tr>
			<td className="text-muted">Sujets</td>
			<td className="w-100 px-0 text-center">
				<h5 className="font-weight-bold mb-0">
					<NumberFormat
						value={sujet.prix_animaux + sujet.transport}
						displayType={"text"}
						thousandSeparator={true}
						suffix={" XAF"}
					/>
					{" / "}
					<NumberFormat
						value={
							vagueActuelle.budget_animaux == 0
								? sujet.prix_animaux + sujet.transport
								: vagueActuelle.budget_animaux
						}
						displayType={"text"}
						thousandSeparator={true}
						suffix={" XAF"}
					/>
				</h5>
				<div className="progress progress-md">
					<div
						className={`progress-bar ${
							setProgressBar() < 51
								? "bg-gradient-success"
								: setProgressBar() > 50 && setProgressBar() < 85
								? "bg-gradient-warning"
								: "bg-gradient-danger"
						}`}
						role="progressbar"
						style={{
							width: `${setProgressBar()}%`,
						}}
						aria-valuenow="70"
						aria-valuemin="0"
						aria-valuemax="100"
					></div>
				</div>
			</td>
			<td>
				<Link to={`/pages/vagues/${vagueId}`}>
					<button type="button" className="btn btn-warning">
						<i class="tim-icons icon-chart-pie-36"></i>
					</button>
				</Link>
			</td>
		</tr>
	);
}

export default VagueCout;

import React, { useState, useEffect } from "react";
import NumberFormat from "react-number-format";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import LocalStorage from "localStorage";
import Axios from "axios";

//---------------------------Recupération de la somme des couts d'achat et de transport de la table aliment pour un user et une vague
function AlimentsCout(props) {
	const [vagueId, setVagueId] = useState(props.vagueId);
	const [aliment, setAliment] = useState({});
	const [vagueList, setVagueList] = useState(
		JSON.parse(LocalStorage.getItem("vagueList"))
			? JSON.parse(LocalStorage.getItem("vagueList"))
			: []
	);
	const [vague, setVague] = useState({});

	useEffect(() => {
		getVague(vagueList);
		getAlimentPrix(vagueId);
	}, []);
	useEffect(() => {
		getAlimentPrix(vagueId);
	}, [props.depenseActu, vague]);

	//recuperer le prix et transport des aliment de la vague en session
	const getAlimentPrix = (vagueId) => {
		Axios.get(`api/cout/aliment/${vagueId}`).then((res) => {
			if (res.status === 200) {
				setAliment(res.data);
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
			setVague(v);
		};

	const setProgressBar = () => {
		let budget_aliments =
			vague.budget_aliments == 0 ? 1 : vague.budget_aliments;
		let progressbar =
			((aliment.prix + aliment.transport) * 100) / budget_aliments;
		return progressbar;
	};

	return (
		<tr>
			<td className="text-muted">Aliments</td>
			<td className="w-100 px-0 text-center">
				<h5 className="font-weight-bold mb-0">
					<NumberFormat
						value={aliment.prix + aliment.transport}
						displayType={"text"}
						thousandSeparator={true}
						suffix={" XAF"}
					/>
					{" / "}
					<NumberFormat
						value={
							vague.budget_aliments == 0
								? aliment.prix + aliment.transport
								: vague.budget_aliments
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
				<Link to={`/pages/vagues/${vagueId}/depenses/aliment`}>
					<button type="button" className="btn btn-warning">
						<i class="tim-icons icon-chart-pie-36"></i>
					</button>
				</Link>
			</td>
		</tr>
	);
}

export default AlimentsCout;

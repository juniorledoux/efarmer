import React, { useState, useEffect } from "react";
import NumberFormat from "react-number-format";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import LocalStorage from "localStorage";
import Axios from "axios";

//---------------------------Recupération de la somme des couts d'achat et de transport de la table main_doeuvre pour un user et une vague
function MainDoeuvreCout(props) {
	const [vagueId, setVagueId] = useState(props.vagueId);
	const [main_doeuvre, setMain_doeuvre] = useState({});
		const [vagueList, setVagueList] = useState(
			JSON.parse(LocalStorage.getItem("vagueList"))
				? JSON.parse(LocalStorage.getItem("vagueList"))
				: []
		);
	const [vague, setVague] = useState({});

	useEffect(() => {
		getVague(vagueList);
		getMainOeuvrePrix(vagueId);
	}, []);
	useEffect(() => {
		getMainOeuvrePrix(vagueId);
	}, [props.depenseActu, vague]);

	//recuperer le prix et transport des main_doeuvre de la vague en session
	const getMainOeuvrePrix = (vagueId) => {
		Axios.get(`api/cout/main_doeuvre/${vagueId}`).then((res) => {
			if (res.status === 200) {
				setMain_doeuvre(res.data);
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
		let budget_main_doeuvre =
			vague.budget_main_doeuvre == 0 ? 1 : vague.budget_main_doeuvre;
		let progressbar = (main_doeuvre.prix * 100) / budget_main_doeuvre;
		return progressbar;
	};

	return (
		<tr>
			<td className="text-muted">Resource humaine </td>
			<td className="w-100 px-0 text-center">
				<h5 className="font-weight-bold mb-0">
					<NumberFormat
						value={main_doeuvre.prix}
						displayType={"text"}
						thousandSeparator={true}
						suffix={" XAF"}
					/>
					{" / "}
					<NumberFormat
						value={
							vague.budget_main_doeuvre == 0
								? main_doeuvre.prix
								: vague.budget_main_doeuvre
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
				<Link to={`/pages/vagues/${vagueId}/depenses/main-doeuvre`}>
					<button type="button" className="btn btn-warning">
						<i class="tim-icons icon-chart-pie-36"></i>
					</button>
				</Link>
			</td>
		</tr>
	);
}

export default MainDoeuvreCout;

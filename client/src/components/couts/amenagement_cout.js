import React, { useState, useEffect } from "react";
import NumberFormat from "react-number-format";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import LocalStorage from "localStorage";
import Axios from "axios";

//---------------------------Recupération de la somme des couts d'achat et de transport de la table amenagement pour un user et une vague
function AmenagementCout(props) {
	const [vagueId, setVagueId] = useState(props.vagueId);
	const [amenagement, setAmenagement] = useState({});
	const [vagueList, setVagueList] = useState(
		JSON.parse(LocalStorage.getItem("vagueList"))
			? JSON.parse(LocalStorage.getItem("vagueList"))
			: []
	);
	const [vague, setVague] = useState({});

	useEffect(() => {
		getVague(vagueList);
		getAmenagementPrix(vagueId);
	}, []);
	useEffect(() => {
		getAmenagementPrix(vagueId);
	}, [props.depenseActu, vague]);

	//recuperer le prix et transport des amenagement de la vague en session
	const getAmenagementPrix = (vagueId) => {
		Axios.get(`api/cout/amenagement/${vagueId}`).then((res) => {
			if (res.status === 200) {
				setAmenagement(res.data);
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
		let budget_amenagements =
			vague.budget_amenagements == 0 ? 1 : vague.budget_amenagements;
		let progressbar =
			((amenagement.prix + amenagement.transport) * 100) /
			budget_amenagements;
		return progressbar;
	};

	return (
		<tr>
			<td className="text-muted">Aménagement</td>
			<td className="w-100 px-0 text-center">
				<h5 className="font-weight-bold mb-0">
					<NumberFormat
						value={amenagement.prix + amenagement.transport}
						displayType={"text"}
						thousandSeparator={true}
						suffix={" XAF"}
					/>
					{" / "}
					<NumberFormat
						value={
							vague.budget_amenagements == 0
								? amenagement.prix + amenagement.transport
								: vague.budget_amenagements
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
				<Link to={`/pages/vagues/${vagueId}/depenses/amenagement`}>
					<button type="button" className="btn btn-warning">
						<i class="tim-icons icon-chart-pie-36"></i>
					</button>
				</Link>
			</td>
		</tr>
	);
}

export default AmenagementCout;

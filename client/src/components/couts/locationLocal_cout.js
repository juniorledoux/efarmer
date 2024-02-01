import React, { useState, useEffect } from "react";
import NumberFormat from "react-number-format";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import LocalStorage from "localStorage";
import Axios from "axios";

//---------------------------Recupération de la somme des couts d'achat et de transport de la table location_local pour un user et une vague
function LocationLocalCout(props) {
	const [vagueId, setVagueId] = useState(props.vagueId);
	const [location_local, setLocation_local] = useState({});
	const [vagueList, setVagueList] = useState(
		JSON.parse(LocalStorage.getItem("vagueList"))
			? JSON.parse(LocalStorage.getItem("vagueList"))
			: []
	);
	const [vague, setVague] = useState({});

	useEffect(() => {
		getVague(vagueList);
		getLocationLocalPrix(vagueId);
	}, []);
	useEffect(() => {
		getLocationLocalPrix(vagueId);
	}, [props.depenseActu, vague]);

	//recuperer le prix et transport des location_local de la vague en session
	const getLocationLocalPrix = (vagueId) => {
		Axios.get(`api/cout/location_local/${vagueId}`).then((res) => {
			if (res.status === 200) {
				setLocation_local(res.data);
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
		let budget_location_local =
			vague.budget_location_local == 0 ? 1 : vague.budget_location_local;
		let progressbar =
			((location_local.prix + location_local.transport) * 100) /
			budget_location_local;
		return progressbar;
	};

	return (
		<tr>
			<td className="text-muted">Location </td>
			<td className="w-100 px-0 text-center">
				<h5 className="font-weight-bold mb-0">
					<NumberFormat
						value={location_local.prix + location_local.transport}
						displayType={"text"}
						thousandSeparator={true}
						suffix={" XAF"}
					/>
					{" / "}
					<NumberFormat
						value={
							vague.budget_location_local == 0
								? location_local.prix + location_local.transport
								: vague.budget_location_local
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
				<Link to={`/pages/vagues/${vagueId}/depenses/location-local`}>
					<button type="button" className="btn btn-warning">
						<i class="tim-icons icon-chart-pie-36"></i>
					</button>
				</Link>
			</td>
		</tr>
	);
}

export default LocationLocalCout;

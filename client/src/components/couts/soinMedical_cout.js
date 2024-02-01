import React, { useState, useEffect } from "react";
import NumberFormat from "react-number-format";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import LocalStorage from "localStorage";
import Axios from "axios";

//---------------------------Recupération de la somme des couts d'achat et de transport de la table soin_medical pour un user et une vague
function SoinMedicalCout(props) {
	const [vagueId, setVagueId] = useState(props.vagueId);
	const [soin_medical, setSoin_medical] = useState({});
	const [vagueList, setVagueList] = useState(
		JSON.parse(LocalStorage.getItem("vagueList"))
			? JSON.parse(LocalStorage.getItem("vagueList"))
			: []
	);
	const [vague, setVague] = useState({});

	useEffect(() => {
		getVague(vagueList);
		getSoinMedicalPrix(vagueId);
	}, []);
	useEffect(() => {
		getSoinMedicalPrix(vagueId);
	}, [props.depenseActu, vague]);

	//recuperer le prix et transport des soin_medical de la vague en session
	const getSoinMedicalPrix = (vagueId) => {
		Axios.get(`api/cout/soin_medical/${vagueId}`).then((res) => {
			if (res.status === 200) {
				setSoin_medical(res.data);
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
		let budget_soins_medicaux =
			vague.budget_soins_medicaux == 0 ? 1 : vague.budget_soins_medicaux;
		let progressbar =
			((soin_medical.prix + soin_medical.transport) * 100) /
			budget_soins_medicaux;
		return progressbar;
	};

	return (
		<tr>
			<td className="text-muted">Médicaments </td>
			<td className="w-100 px-0 text-center">
				<h5 className="font-weight-bold mb-0">
					<NumberFormat
						value={soin_medical.prix + soin_medical.transport}
						displayType={"text"}
						thousandSeparator={true}
						suffix={" XAF"}
					/>
					{" / "}
					<NumberFormat
						value={
							vague.budget_soins_medicaux == 0
								? soin_medical.prix + soin_medical.transport
								: vague.budget_soins_medicaux
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
				<Link to={`/pages/vagues/${vagueId}/depenses/soin-medical`}>
					<button type="button" className="btn btn-warning">
						<i class="tim-icons icon-chart-pie-36"></i>
					</button>
				</Link>
			</td>
		</tr>
	);
}

export default SoinMedicalCout;

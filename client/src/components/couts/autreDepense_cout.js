import React, { useState, useEffect } from "react";
import NumberFormat from "react-number-format";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import LocalStorage from "localStorage";
import Axios from "axios";

//---------------------------Recupération de la somme des couts d'achat de la table autre_depense pour un user et une vague
function AutreDepenseCout(props) {
	const [vagueId, setVagueId] = useState(props.vagueId);
	const [autre_depense, setAutre_depense] = useState({});
	const [vagueList, setVagueList] = useState(
		JSON.parse(LocalStorage.getItem("vagueList"))
			? JSON.parse(LocalStorage.getItem("vagueList"))
			: []
	);
	const [vague, setVague] = useState({});

	useEffect(() => {
		getVague(vagueList);
		getAutreDepensePrix(vagueId);
	}, []);
	useEffect(() => {
		getAutreDepensePrix(vagueId);
	}, [props.depenseActu, vague]);

	const getVague = (vagueList) => {
		let v = {};
		vagueList.forEach((vague) => {
			if (vague._id == vagueId) {
				v = vague;
			}
		});
		setVague(v);
	};

	//recuperer le prix des autre_depense de la vague en session
	const getAutreDepensePrix = (vagueId) => {
		Axios.get(`api/cout/autre_depense/${vagueId}`).then((res) => {
			if (res.status === 200) {
				setAutre_depense(res.data);
			}
		});
	};

	const setProgressBar = () => {
		let budget_autres_depenses =
			vague.budget_autres_depenses == 0
				? 1
				: vague.budget_autres_depenses;
		let progressbar = (autre_depense.prix * 100) / budget_autres_depenses;
		return progressbar;
	};

	return (
		<tr>
			<td className="text-muted">Autres dépenses</td>
			<td className="w-100 px-0 text-center">
				<h5 className="font-weight-bold mb-0">
					<NumberFormat
						value={autre_depense.prix}
						displayType={"text"}
						thousandSeparator={true}
						suffix={" XAF"}
					/>
					{" / "}
					<NumberFormat
						value={
							vague.budget_autres_depenses == 0
								? autre_depense.prix
								: vague.budget_autres_depenses
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
				<Link to={`/pages/vagues/${vagueId}/depenses/autre-depense`}>
					<button type="button" className="btn btn-warning">
						<i class="tim-icons icon-chart-pie-36"></i>
					</button>
				</Link>
			</td>
		</tr>
	);
}

export default AutreDepenseCout;

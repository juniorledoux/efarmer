import React, { useState, useEffect } from "react";
import NumberFormat from "react-number-format";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import LocalStorage from "localStorage";
import Axios from "axios";

//---------------------------Recupération de la somme des couts d'achat de la table transport_vente pour un user et une vague
function TransportVenteCout(props) {
	const [vagueId, setVagueId] = useState(props.vagueId);
	const [transport_vente, setTransport_vente] = useState({});
	const [vagueList, setVagueList] = useState(
		JSON.parse(LocalStorage.getItem("vagueList"))
			? JSON.parse(LocalStorage.getItem("vagueList"))
			: []
	);
	const [vague, setVague] = useState({});

	useEffect(() => {
		getVague(vagueList);
		getTransportVentePrix(vagueId);
	}, []);
	useEffect(() => {
		getTransportVentePrix(vagueId);
	}, [props.depenseActu, vague]);

	//recuperer le prix des transport_vente de la vague en session
	const getTransportVentePrix = (vagueId) => {
		Axios.get(`api/cout/transport_vente/${vagueId}`).then((res) => {
			if (res.status === 200) {
				setTransport_vente(res.data);
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
		let budget_transport_vente =
			vague.budget_transport_vente == 0
				? 1
				: vague.budget_transport_vente;
		let progressbar = (transport_vente.prix * 100) / budget_transport_vente;
		return progressbar;
	};

	return (
		<tr>
			<td className="text-muted">Charges de livraison </td>
			<td className="w-100 px-0 text-center">
				<h5 className="font-weight-bold mb-0">
					<NumberFormat
						value={transport_vente.prix}
						displayType={"text"}
						thousandSeparator={true}
						suffix={" XAF"}
					/>
					{" / "}
					<NumberFormat
						value={
							vague.budget_transport_vente == 0
								? transport_vente.prix
								: vague.budget_transport_vente
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
				<Link to={`/pages/vagues/${vagueId}/depenses/transport-vente`}>
					<button type="button" className="btn btn-warning">
						<i class="tim-icons icon-chart-pie-36"></i>
					</button>
				</Link>
			</td>
		</tr>
	);
}

export default TransportVenteCout;

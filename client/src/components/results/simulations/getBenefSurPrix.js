import React, { useState, useEffect } from "react";
import NumberFormat from "react-number-format";
import LocalStorage from "localStorage";
import Axios from "axios";
import Popup from "reactjs-popup";
import {
	Provider as AlertProvider,
	useAlert,
	positions,
	types,
	transitions,
} from "react-alert";

function BenefSurPrix(props) {
	const [vagueId, setVagueId] = useState(props.VAGUEID);
	const [benefSurPrix, setBenefSurPrix] = useState("");
	const [prixMarche, setPrixMarche] = useState(0);
	// const [vague, setVague] = useState({});

	useEffect(() => {
		// getVague(vagueId);
	}, []);

	const Alert = useAlert();

	const showAlertSuccess = (msg) => {
		Alert.show(msg, {
			type: types.SUCCESS,
		});
	};
	const showAlertError = (msg) => {
		Alert.show(msg, {
			type: types.ERROR,
		});
	};

	const getBenefSurPrix = (vagueId) => {
		props.setLoading(true);
		if (prixMarche < 0) {
			props.setLoading(false);
			return showAlertError("Entrer un prix cohérent");
		}
		Axios.post(`api/results/benef_sur_prix/${vagueId}`, {
			prixMarche: prixMarche,
		})
			.then((res) => {
				if (res.status === 200) {
					setBenefSurPrix(res.data.benefSurPrix);
				}
				props.setLoading(false);
			})
			.catch((error) => {
				showAlertError(error.response.data.message);
				setLoading(false);
			});
	};

	//recuperer la vague
	// const getVague = (vagueId) => {
	// 	Axios.get(`api/customers/vague/${vagueId}`).then((res) => {
	// 		if (res.status === 200) {
	// 			setVague(res.data);
	// 		}
	// 	});
	// };

	const getRapport = () => {
		if (benefSurPrix < 0) {
			return (
				<p>
					Pour une vente à ce prix vous allez avoir une{" "}
					<strong className="text-danger">
						perte de :{" "}
						{
							<NumberFormat
								value={benefSurPrix * -1}
								displayType={"text"}
								thousandSeparator={true}
								decimalScale={true}
								suffix={" XAF"}
							/>
						}
					</strong>{" "}
					sur l'ensemble de vos dépenses.
				</p>
			);
		} else if (benefSurPrix > 0) {
			return (
				<p>
					Pour une vente à ce prix vous allez avoir un{" "}
					<strong className="text-success">
						bénéfice de :{" "}
						{
							<NumberFormat
								value={benefSurPrix}
								displayType={"text"}
								thousandSeparator={true}
								decimalScale={true}
								suffix={" XAF"}
							/>
						}
					</strong>{" "}
					sur l'ensemble de vos dépenses.
				</p>
			);
		} else if (benefSurPrix === 0) {
			return (
				<p>
					Pour une vente à ce prix vous allez{" "}
					<strong className="text-warning">
						juste récupérer l'ensemble de vos dépenses.
					</strong>
				</p>
			);
		} else return "";
	};

	return (
		<span className="">
			<a
				className="text-dark text-decoration-underline font-weight-bold"
				data-bs-target="#simulation"
				data-bs-toggle="modal"
				data-bs-dismiss="modal"
			>
				{" "}
				Prix{" "}
			</a>
			<div
				id="simulation"
				class="modal fade text-dark"
				aria-hidden="true"
				aria-labelledby="simulationLabel"
				tabindex="-1"
				data-bs-keyboard="false"
			>
				<div
					class="modal-dialog modal-dialog-centered modal-md modal-dialog-scrollable"
					style={{ margin: "auto", marginTop: "30px" }}
				>
					<div class="modal-content">
						<div class="modal-header">
							<h5 class="modal-title" id="simulationLabel">
								Simulation du résultat avec un prix de vente.
							</h5>
							<button
								class="btn-close"
								type="button"
								data-bs-dismiss="modal"
								aria-label="Close"
							></button>
						</div>
						<div class="modal-body">
							<div className="form-group">
								<label>
									Entrer un prix de vente des sujets sur le
									marché.
								</label>
								<input
									type="number"
									min={0}
									title="Entrer un prix de vente des sujets sur le marché."
									placeholder={prixMarche}
									onChange={(event) => {
										setPrixMarche(event.target.value);
									}}
									className="form-control"
								/>
							</div>

							<hr style={{ border: "1.5px dotted black" }} />

							<div className="mt-2 text-start">
								{getRapport()}
							</div>
						</div>
						<div class="modal-footer">
							<button
								className="btn btn-outline-success m-auto btn-fw"
								onClick={() => {
									getBenefSurPrix(vagueId);
								}}
							>
								{" "}
								Simuler
							</button>
						</div>
					</div>
				</div>
			</div>
		</span>
	);
}

export default BenefSurPrix;

import React, { useState, useEffect } from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Link,
	Navigate,
} from "react-router-dom";
import NavBar from "../components/utils/navBar";
import LocalStorage from "localStorage";
import { useParams } from "react-router-dom";
import RapportProfits from "../components/vagueRapportComponent/rapportProfits";
import ClipLoader from "react-spinners/ClipLoader";

function PageRevenusVagues() {
	const { vagueId } = useParams();
	const [vagueList, setVagueList] = useState(
		JSON.parse(LocalStorage.getItem("vagueList"))
			? JSON.parse(LocalStorage.getItem("vagueList"))
			: []
	);
	const [loading, setLoading] = useState(false);
	// useEffect(() => {}, []);
	const getVagueList = () => {
		setVagueList(
			JSON.parse(LocalStorage.getItem("vagueList"))
				? JSON.parse(LocalStorage.getItem("vagueList"))
				: []
		);
	};

	return (
		<div>
			<NavBar
				VAGUEID={vagueId}
				vagueList={vagueList}
				funtionToUpdate={getVagueList}
			/>
			<div className="p-0 col-lg-10" style={{ float: "right" }}>
				<div className="container-fluid page-body-wrapper">
					<div className="main-panel" style={{ width: "100%" }}>
						<div
							style={{
								padding: "30px",
								backgroundColor: "#f5f7ff",
								height: "100%",
							}}
						>
							
							<Link
								to={`/pages/vagues/${vagueId}`}
								class="p-2 float-lg-left mt-3 mb-5"
							>
								<i
									class="tim-icons icon-double-left"
									style={{
										color: "rgba(76, 16, 255, 0.777)",
										fontWeight: "bold",
									}}
								></i>
							</Link>
							<h2 className="text-center bg-gradient-info rounded text-white p-2 col-lg-7 mt-2 mx-auto">
								Profits
							</h2>
							<div
								style={{
									marginTop: "40px",
									marginBottom: "45px",
								}}
							>
								<RapportProfits
									vagueId={vagueId}
									setLoading={setLoading}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
			{loading ? (
				<div
					className="d-flex justify-content-center align-items-center"
					style={{
						width: "100%",
						height: "100%",
						position: "fixed",
						top: "0",
						left: "0",
						zIndex: 1210,
						background: "#000",
						opacity: 0.5,
					}}
				>
					<ClipLoader
						color={"#0a58ca"}
						loading={loading}
						size={135}
						aria-label="Loading Spinner"
						data-testid="loader"
					/>
				</div>
			) : (
				""
			)}
		</div>
	);
}

export default PageRevenusVagues;

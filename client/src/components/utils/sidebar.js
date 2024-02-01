import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { Offcanvas } from "react-bootstrap";
import bootstrap from "bootstrap";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import LocalStorage from "localStorage";

function SideBar(props) {
	const [show, setShow] = useState(false);
	const [vagueId, setVagueId] = useState(props.VAGUEID);
	const [currentVague, setCurrentVague] = useState(props.currentVague);

	const handleClose = () => {
		setShow(false);
	};
	const handleShow = () => {
		setShow(true);
	};

	return (
		<div>
			<nav
				className="sidebar sidebar-offcanvas position-fixed"
				id="sidebar"
				style={{
					float: "left",
					marginTop: "40px",
					height: "100%",
					background: "rgb(245, 247, 255)",
					borderRight: "3px solid rgba(76, 16, 255, 0.444)",
				}}
			>
				<div className="navbar-menu-wrapper d-flex align-items-center justify-content-end">
					<ul className="nav" style={{ width: "100%" }}>
						<li className="nav-item">
							<Link
								to="/pages/vagues"
								className={`nav-link`}
								style={{
									color: window.location.pathname.includes(
										"vague"
									)
										? "rgba(76, 16, 255, 0.777)"
										: "",
								}}
								data-toggle="collapse"
								aria-expanded="false"
								aria-controls="ui-basic"
							>
								<i
									className="icon-grid menu-icon"
									style={{
										color: window.location.pathname.includes(
											"vagues"
										)
											? "rgba(76, 16, 255, 0.777)"
											: "",
									}}
								></i>
								<span className="menu-title">
									Liste des Vagues
								</span>
							</Link>
						</li>
						<li className="nav-item">
							<a
								className={`nav-link`}
								data-bs-target="#ajoutVague"
								data-bs-toggle="modal"
								data-bs-dismiss="modal"
							>
								<i class="tim-icons icon-simple-add menu-icon font-weight-bold"></i>
								<span className="menu-title">
									Ajouter une vague
								</span>
							</a>
						</li>
						<li
							className={`nav-item ${
								!vagueId || currentVague.etat == 2
									? "d-none"
									: ""
							}`}
						>
							<a
								className={`nav-link `}
								data-bs-target="#ajoutDepense"
								data-bs-toggle="modal"
								data-bs-dismiss="modal"
							>
								<i class="tim-icons icon-chart-pie-36 menu-icon font-weight-bold"></i>
								<span className="menu-title">
									Ajouter une dépense
								</span>
							</a>
						</li>
						<li
							className={`nav-item ${
								!vagueId || currentVague.etat == 2
									? "d-none"
									: ""
							}`}
							onClick={handleClose}
						>
							<a
								className={`nav-link`}
								data-bs-target="#addConsommationModal"
								data-bs-toggle="modal"
								data-bs-dismiss="modal"
							>
								<i class="tim-icons icon-components menu-icon"></i>
								<span className="menu-title">
									Consommations
								</span>
							</a>
						</li>
						<li
							className={`nav-item ${
								!vagueId || currentVague.etat == 2
									? "d-none"
									: ""
							}`}
						>
							<a
								className={`nav-link `}
								data-bs-target="#ajoutPerte"
								data-bs-toggle="modal"
								data-bs-dismiss="modal"
							>
								<i class="tim-icons icon-alert-circle-exc  menu-icon font-weight-bold"></i>
								<span className="menu-title">
									Ajouter une perte
								</span>
							</a>
						</li>
						<li
							className={`nav-item ${
								!vagueId || currentVague.etat == 2
									? "d-none"
									: ""
							}`}
						>
							<a
								className={`nav-link `}
								data-bs-target="#ajoutVente"
								data-bs-toggle="modal"
								data-bs-dismiss="modal"
							>
								<i class="tim-icons icon-coins menu-icon"></i>
								<span className="menu-title">
									Ajouter une vente
								</span>
							</a>
						</li>
						<li
							className={`nav-item ${
								!vagueId || currentVague.etat == 2
									? "d-none"
									: ""
							}`}
						>
							<Link
								to={`/pages/vagues/${vagueId}/profits`}
								className="nav-link"
								style={{
									color: window.location.pathname.includes(
										"profits"
									)
										? "rgba(76, 16, 255, 0.777)"
										: "",
								}}
								data-toggle="collapse"
								aria-expanded="false"
								aria-controls="form-elements"
							>
								<i
									className="tim-icons icon-trophy menu-icon"
									style={{
										color: window.location.pathname.includes(
											"profits"
										)
											? "rgba(76, 16, 255, 0.777)"
											: "",
									}}
								></i>
								<span className="menu-title">
									Profits des vagues
								</span>
							</Link>
						</li>
						<li className="nav-item">
							<Link
								to="/pages/fournisseur"
								className="nav-link"
								style={{
									color: window.location.pathname.includes(
										"fournisseur"
									)
										? "rgba(76, 16, 255, 0.777)"
										: "",
								}}
								data-toggle="collapse"
								aria-expanded="false"
								aria-controls="form-elements"
							>
								<i
									className="tim-icons icon-delivery-fast menu-icon"
									style={{
										color: window.location.pathname.includes(
											"fournisseur"
										)
											? "rgba(76, 16, 255, 0.777)"
											: "",
									}}
								></i>
								<span className="menu-title">
									Liste des fournisseurs
								</span>
							</Link>
						</li>
					</ul>
				</div>
			</nav>
		</div>
	);
}

export default SideBar;

// <li class="nav-item" id="categorieNavBar">
// 							<div class="accordion-item">
// 								<li
// 									to="#"
// 									id="flush-categorieNavBarLabel"
// 									data-bs-toggle="collapse"
// 									data-bs-target="#flush-categorieNavBar"
// 									aria-expanded="false"
// 									aria-controls="flush-categorieNavBar"
// 									className={`nav-link`}
// 								>
// 									<i className="tim-icons icon-chart-pie-36 menu-icon"></i>
// 									<span className="menu-title">
// 										Catégories
// 									</span>
// 								</li>

// 								<div
// 									id="flush-categorieNavBar"
// 									class="accordion-collapse collapse"
// 									aria-labelledby="flush-categorieNavBarLabel"
// 									data-bs-parent="#categorieNavBar"
// 								>
// 									<div
// 										class="accordion-body"
// 										// style={{
// 										// 	height: "200px",
// 										// 	overflow: "auto",
// 										// }}
// 									>
// 										<Link
// 											to="/pages/aliment"
// 											className={`nav-link`}
// 											style={{
// 												color: window.location.pathname.includes(
// 													"aliment"
// 												)
// 													? "rgb(76, 16, 255)"
// 													: "",
// 											}}
// 											data-toggle="collapse"
// 											aria-expanded="false"
// 											aria-controls="form-elements"
// 										>
// 											<i class="tim-icons icon-notes mx-2"></i>
// 											<span className="menu-title">
// 												Aliments
// 											</span>
// 											<i className="menu-arrow"></i>
// 										</Link>
// 										<Link
// 											to="/pages/soin_medical"
// 											className={`nav-link`}
// 											style={{
// 												color: window.location.pathname.includes(
// 													"soin_medical"
// 												)
// 													? "rgb(76, 16, 255)"
// 													: "",
// 											}}
// 											data-toggle="collapse"
// 											aria-expanded="false"
// 											aria-controls="tables"
// 										>
// 											{/* <i className="icon-grid-2 menu-icon"></i> */}
// 											<i class="tim-icons icon-notes mx-2"></i>
// 											<span className="menu-title">
// 												Médicaments
// 											</span>
// 											<i className="menu-arrow"></i>
// 										</Link>
// 										<Link
// 											to="/pages/amenagement"
// 											className={`nav-link`}
// 											style={{
// 												color: window.location.pathname.includes(
// 													"amenagement"
// 												)
// 													? "rgb(76, 16, 255)"
// 													: "",
// 											}}
// 											data-toggle="collapse"
// 											aria-expanded="false"
// 											aria-controls="icons"
// 										>
// 											{/* <i className="icon-contract menu-icon"></i> */}
// 											<i class="tim-icons icon-notes mx-2"></i>
// 											<span className="menu-title">
// 												Aménagements
// 											</span>
// 											<i className="menu-arrow"></i>
// 										</Link>
// 										<Link
// 											to="/pages/location_local"
// 											className={`nav-link`}
// 											style={{
// 												color: window.location.pathname.includes(
// 													"location_local"
// 												)
// 													? "rgb(76, 16, 255)"
// 													: "",
// 											}}
// 											data-toggle="collapse"
// 											aria-expanded="false"
// 											aria-controls="auth"
// 										>
// 											{/* <i className="icon-head menu-icon"></i> */}
// 											<i class="tim-icons icon-notes mx-2"></i>
// 											<span className="menu-title">
// 												Locations locaux
// 											</span>
// 											<i className="menu-arrow"></i>
// 										</Link>
// 										<Link
// 											to="/pages/electricite"
// 											className={`nav-link`}
// 											style={{
// 												color: window.location.pathname.includes(
// 													"electricite"
// 												)
// 													? "rgb(76, 16, 255)"
// 													: "",
// 											}}
// 										>
// 											<i class="tim-icons icon-notes mx-2"></i>
// 											<span className="menu-title">
// 												Electricités
// 											</span>
// 											<i className="menu-arrow"></i>
// 										</Link>
// 										<Link
// 											to="/pages/eau"
// 											className={`nav-link`}
// 											style={{
// 												color: window.location.pathname.includes(
// 													"eau"
// 												)
// 													? "rgb(76, 16, 255)"
// 													: "",
// 											}}
// 										>
// 											<i class="tim-icons icon-notes mx-2"></i>
// 											<span className="menu-title">
// 												Eaux
// 											</span>
// 											<i className="menu-arrow"></i>
// 										</Link>
// 										<Link
// 											to="/pages/autre_depense"
// 											className={`nav-link`}
// 											style={{
// 												color: window.location.pathname.includes(
// 													"autre_depense"
// 												)
// 													? "rgb(76, 16, 255)"
// 													: "",
// 											}}
// 										>
// 											<i class="tim-icons icon-notes mx-2"></i>
// 											<span className="menu-title">
// 												Autres dépenses
// 											</span>
// 											<i className="menu-arrow"></i>
// 										</Link>
// 										<Link
// 											to="/pages/main_doeuvre"
// 											className={`nav-link`}
// 											style={{
// 												color: window.location.pathname.includes(
// 													"main_doeuvre"
// 												)
// 													? "rgb(76, 16, 255)"
// 													: "",
// 											}}
// 										>
// 											{/* <i className="icon-ban menu-icon"></i> */}
// 											<i class="tim-icons icon-notes mx-2"></i>
// 											<span className="menu-title">
// 												Resources humaines
// 											</span>
// 											<i className="menu-arrow"></i>
// 										</Link>
// 										<Link
// 											to="/pages/transport_vente"
// 											className={`nav-link`}
// 											style={{
// 												color: window.location.pathname.includes(
// 													"transport_vente"
// 												)
// 													? "rgb(76, 16, 255)"
// 													: "",
// 											}}
// 										>
// 											<i class="tim-icons icon-notes mx-2"></i>
// 											<span className="menu-title">
// 												Charges de livraison
// 											</span>
// 											<i className="menu-arrow"></i>
// 										</Link>
// 									</div>
// 								</div>
// 							</div>
// 						</li>

// 						<li className="nav-item">
// 							<Link
// 								to={`/pages/vente/${vagueId}`}
// 								className="nav-link"
// 								style={{
// 									color: window.location.pathname.includes(
// 										"/vente"
// 									)
// 										? "rgba(76, 16, 255, 0.777)"
// 										: "",
// 								}}
// 								data-toggle="collapse"
// 								aria-expanded="false"
// 								aria-controls="form-elements"
// 							>
// 								<i
// 									className="tim-icons icon-coins menu-icon"
// 									style={{
// 										color: window.location.pathname.includes(
// 											"/vente"
// 										)
// 											? "rgba(76, 16, 255, 0.777)"
// 											: "",
// 									}}
// 								></i>
// 								<span className="menu-title">
// 									Statistiques Ventes
// 								</span>
// 							</Link>
// 						</li>
//

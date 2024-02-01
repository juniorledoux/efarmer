import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import Home from "./Home";
import Login from "./pages/login";
import SignUp from "./pages/signup";

import FirstVague from "./pages/firstVague";
import VagueIndex from "./pages/vagues/index";
import VagueShow from "./pages/vagues/show";

import PageStock from "./pages/stock/stock";
import PageDepenses from "./pages/depenses/index";
import PagePerte from "./pages/pertes/perte";
import PageVente from "./pages/ventes/vente";

import PageAliment from "./pages/depenses/aliment";
import PageAmenage from "./pages/depenses/amenagement";
import PageAutreDepense from "./pages/depenses/autre_depense";
import PageEau from "./pages/depenses/eau";
import PageElectricite from "./pages/depenses/electricite";
import PageMain_Doeuvre from "./pages/depenses/main_doeuvre";
import PageSoin_medical from "./pages/depenses/soin_medical";
import PageLocation_Local from "./pages/depenses/location_local";
import PageTransport_Vente from "./pages/depenses/transport_vente";
import PageRapportVague from "./pages/rapportVague";
import Profil from "./pages/utilisateur";
import EditProfil from "./components/utilisateur";
import PageFournisseur from "./pages/fournisseur";
import PageAvancePayement from "./pages/avancePayement";
import PageAlimentUtilisee from "./pages/aliment_utilisee";
import PageSoinsConsomme from "./pages/soinsConsomme";
import PageRevenusVagues from "./pages/revenus_vagues";

function App() {
	return (
		<Router>
			<Routes>
				<Route exact path="/" element={<Home />} />
				<Route path="/sign-in" element={<Login />} />
				<Route path="/sign-up" element={<SignUp />} />

				<Route path="/first-vague" element={<FirstVague />} />
				<Route path="/pages/vagues" element={<VagueIndex />} />

				<Route path="/pages/profil" element={<Profil />} />
				<Route path="/pages/profil/edit" element={<EditProfil />} />

				<Route path="/pages/vagues/:vagueId" element={<VagueShow />} />

				<Route
					path="/pages/vagues/:vagueId/depenses/aliment"
					exact
					element={<PageAliment />}
				/>

				<Route
					path="/pages/vagues/:vagueId/stock"
					exact
					element={<PageStock />}
				/>

				<Route
					path="/pages/vagues/:vagueId/depenses"
					exact
					element={<PageDepenses />}
				/>

				<Route
					path="/pages/vagues/:vagueId/depenses/amenagement"
					exact
					element={<PageAmenage />}
				/>

				<Route
					path="/pages/vagues/:vagueId/depenses/autre-depense"
					exact
					element={<PageAutreDepense />}
				/>

				<Route
					path="/pages/vagues/:vagueId/depenses/eau"
					exact
					element={<PageEau />}
				/>

				<Route
					path="/pages/vagues/:vagueId/depenses/electricite"
					exact
					element={<PageElectricite />}
				/>

				<Route
					path="/pages/vagues/:vagueId/depenses/main-doeuvre"
					exact
					element={<PageMain_Doeuvre />}
				/>

				<Route
					path="/pages/vagues/:vagueId/depenses/location-local"
					exact
					element={<PageLocation_Local />}
				/>

				<Route
					path="/pages/vagues/:vagueId/depenses/soin-medical"
					exact
					element={<PageSoin_medical />}
				/>

				<Route
					path="/pages/vagues/:vagueId/depenses/transport-vente"
					exact
					element={<PageTransport_Vente />}
				/>

				<Route
					path="/pages/vagues/:vagueId/ventes"
					exact
					element={<PageVente />}
				/>

				<Route
					path="/pages/vagues/:vagueId/rapport"
					exact
					element={<PageRapportVague />}
				/>

				<Route
					path="/pages/fournisseur"
					exact
					element={<PageFournisseur />}
				/>

				<Route
					path="/pages/vagues/:vagueId/profits"
					exact
					element={<PageRevenusVagues />}
				/>

				<Route
					path="/pages/vagues/:vagueId/depenses/soin-medical/:soinsMedicalId/consommations"
					exact
					element={<PageSoinsConsomme />}
				/>
				<Route
					path="/pages/vagues/:vagueId/depenses/aliment/:alimentId/consommations"
					exact
					element={<PageAlimentUtilisee />}
				/>

				<Route
					path="/pages/vagues/:vagueId/pertes"
					exact
					element={<PagePerte />}
				/>

				<Route
					path="/pages/vagues/:vagueId/ventes/:venteId/avance-payement"
					exact
					element={<PageAvancePayement />}
				/>
			</Routes>
		</Router>
	);
}

export default App;

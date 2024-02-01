import React from 'react';
import logo from "../../components/assets/images/logo.png";
import logoMini from "../../components/assets/images/logo-mini.svg";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

const simplenabar = () => {
    return (
		<div>
			<div className="p-3">
				<nav className="navbar col-lg-12 col-12 p-0 fixed-top d-flex flex-row">
					<div className="text-center navbar-brand-wrapper d-flex align-items-center justify-content-center">
						<Link
							to="/"
							className="navbar-brand brand-logo mr-5"
							data-toggle="collapse"
							aria-expanded="false"
							aria-controls="form-elements"
						>
							<img src={logo} className="mr-2" alt="logo" />
						</Link>
						<Link
							to="/"
							className="navbar-brand brand-logo-mini"
							data-toggle="collapse"
							aria-expanded="false"
							aria-controls="form-elements"
						>
							<img src={logoMini} alt="logo" />
						</Link>
					</div>
					<div className="navbar-menu-wrapper d-flex align-items-center justify-content-end"></div>
				</nav>
			</div>
		</div>
	);
};

export default simplenabar;
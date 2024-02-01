import React from "react";
import "./home.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

const Home = () => {
	return (
		<div className="contentO mt-0">
			<div className="welcomeO upperO">
				<center>BIENVENUE à Sfarmer</center>
			</div>
			<div className="engO upperO">
				<center>welcome to sfarmer</center>
			</div>

			<center>
				<div className="btnsO">
					<Link to="/sign-up">
						<span className="btnO btn-primary px-3">Sign Up</span>
					</Link>
					<span
						style={{
							paddingLeft: "50px",
						}}
					>
						{" "}
					</span>
					<Link to="/sign-in">
						<span className="btnO btn-primary px-4">Login</span>
					</Link>
				</div>
			</center>
		</div>
	);
};

export default Home;

import React, { Component } from "react";
import NumberFormat from "react-number-format";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import LocalStorage from "localStorage";
import Axios from "axios";

//---------------------------Recupération de la somme des couts d'achat et de transport de la table aliment pour un user et une vague
class Empty extends Component {
	constructor() {
		super();
		this.state = {};
	}
	componentDidMount() {}

	render() {
		return (
			<tr>
				<td className="text-muted"></td>
				<td className="w-100 px-0">
					<div className="mx-5"></div>
				</td>
				<td></td>
			</tr>
		);
	}
}

export { Empty };

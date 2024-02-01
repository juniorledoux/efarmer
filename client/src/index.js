import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import registerServiceWorker from "./registerServiceWorker";
import Axios from "axios";
import Env from "./env";
import LocalStorage from "localStorage";
import {
	Provider as AlertProvider,
	useAlert,
	positions,
	transitions,
} from "react-alert";
import AlertTemplate from "react-alert-template-basic";

Axios.defaults.baseURL = `${Env.SERVER_URL}`;
Axios.defaults.headers.common["Authorization"] = `Bearer ${JSON.parse(
	LocalStorage.getItem("userToken")
)}`;

const alertOptions = {
	offset: "50px",
	timeout: 4000,
	transition: transitions.SCALE,
	containerStyle: {
		zIndex: 1222,
	},
};

ReactDOM.render(
	<AlertProvider template={AlertTemplate}>
		<AlertProvider
			template={AlertTemplate}
			position={positions.TOP_CENTER} //default position for all alerts without individual position
			{...alertOptions}
		>
			<App />
		</AlertProvider>
	</AlertProvider>,
	document.getElementById("root")
);
registerServiceWorker();

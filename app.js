const express = require("express");
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const bodyparser = require("body-parser");

//importations des routes
const vagueRoutes = require('./routes/vague');
const userRoutes = require('./routes/user');
const alimentRoutes = require('./routes/donnees/aliment');
const amenagementRoutes = require('./routes/donnees/amenagement');
// const animalRoutes = require('./routes/donnees/animal');
const autre_depenseRoutes = require("./routes/donnees/autre_depense");
const eauRoutes = require('./routes/donnees/eau');
const electriciteRoutes = require('./routes/donnees/electricite');
const location_localRoutes = require('./routes/donnees/location_local');
const main_doeuvreRoutes = require('./routes/donnees/main_doeuvre');
const soin_medicalRoutes = require('./routes/donnees/soin_medical');
const transport_venteRoutes = require('./routes/donnees/transport_vente');
const resultsRoutes = require('./routes/results');

const coutRoutes = require("./routes/donnees/cout/cout");
const perteRoutes = require("./routes/perte");
const poidsRoutes = require("./routes/poids");
const venteRoutes = require("./routes/vente");
const alimentUtiliseRoutes = require("./routes/alimentUtilise");
const recyclageAlimentRoutes = require("./routes/recyclage_aliment");

const recyclageSoinsRoutes = require("./routes/recyclage_soins");
const soinsConsommeRoutes = require("./routes/soinsConsomme");

const acheteurRoutes = require("./routes/acheteur");
const fournisseurRoutes = require("./routes/fournisseur");

const rapportVagueRoutes = require("./routes/rapports/rapportVague");
const avancePayementRoutes = require("./routes/avancePayement");
const profitsRoutes = require("./routes/profits");
const stockRoutes = require("./routes/stock");

//variable du lien vers la base de donnees
const mongodbUri =
	"mongodb+srv://luc:Hitaye04@cluster0.7gjdad5.mongodb.net/?retryWrites=true&w=majority";
	// "mongodb://localhost:27017/sfarmers";

	//connection a la base de donnees
	mongoose.set("strictQuery", true);
mongoose
	.connect(mongodbUri, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => console.log("Connexion à MongoDB réussie !"))
	.catch(() => console.log("Connexion à MongoDB échouée !"));

//initialisation de l'app
const app = express();  

app.use(express.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(cors());

app.use("/api/aliments", alimentRoutes);
app.use("/api/amenagement", amenagementRoutes);
// app.use("/api/animal", animalRoutes);
app.use("/api/autre_depense", autre_depenseRoutes);
app.use("/api/eau", eauRoutes);
app.use("/api/electricite", electriciteRoutes);
app.use("/api/location_local", location_localRoutes);
app.use("/api/main_doeuvre", main_doeuvreRoutes);
app.use("/api/soin_medical", soin_medicalRoutes);
app.use("/api/transport_vente", transport_venteRoutes);
app.use('/api/dashboard', vagueRoutes);
app.use('/api/customers', vagueRoutes);

app.use("/api/cout", coutRoutes);
app.use("/api/perte", perteRoutes);
app.use("/api/poids", poidsRoutes);
app.use("/api/vente", venteRoutes);
app.use("/api/alimentutilise", alimentUtiliseRoutes);
app.use("/api/recyclage/aliment", recyclageAlimentRoutes);

app.use("/api/recyclage/soins", recyclageSoinsRoutes);
app.use("/api/soinsConsomme", soinsConsommeRoutes);

app.use("/api/acheteur", acheteurRoutes);
app.use("/api/fournisseur", fournisseurRoutes);

app.use("/api/rapport_vague", rapportVagueRoutes);
app.use("/api/avancePayement", avancePayementRoutes);

app.use('/api/auth', userRoutes);

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/files', express.static(path.join(__dirname, 'files')));
app.use("/api/results", resultsRoutes);
app.use("/api/profits", profitsRoutes);
app.use("/api/stock", stockRoutes);


module.exports = app;
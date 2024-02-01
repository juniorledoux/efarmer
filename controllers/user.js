const User = require("../models/utilisateur");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

//pour la suppression du Compteconst Animal = require("../../models/animal");
const Vague = require("../models/vague");
const Aliment = require("../models/aliment");
const Amenagement = require("../models/amenagement");
const Location_Local = require("../models/location_local");
const Main_Doeuvre = require("../models/main_doeuvre");
const Soin_Medical = require("../models/soin_medical");
const Eau = require("../models/eau");
const Electricite = require("../models/electricite");
const Autre_Depense = require("../models/autre_depense");
const Transport_Vente = require("../models/transport_vente");
const Perte = require("../models/perte");
const Poids = require("../models/poids");
const Vente = require("../models/vente");
const AlimentUtilise = require("../models/alimentUtilise");

//methode signup
exports.signup = (req, res, next) => {
	//recuperer les champs dans des variables
	const nom = req.body.nom;
	const tel = req.body.tel;
	const email = req.body.email;
	const password = req.body.password;

	//verifier les donnéesobligatoires
	if (nom == null || email == null || password == null) {
		return res
			.status(400)
			.json({ message: "Parametre obligatoire requis" });
	}

	//verifier la longeur correcte du nom
	if (nom.length <= 3 || nom.length >= 31)
		return res
			.status(400)
			.json({ message: "Entrez un nom valide (plus de 3 caractères)" });

	//verifier l'email
	const EMAIL_REGEX =
		/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	if (!EMAIL_REGEX.test(email))
		return res.status(400).json({ message: "entrer un email valide" });

	//verifier le password
	if (password.length <= 7)
		return res.status(400).json({
			message: "Entrez un mot de passe valide avec plus de 7 caractères",
		});

	//verifier le tel
	if (tel.length <= 8)
		return res.status(400).json({
			message: "Entrez un numero de telephone valide",
		});

	//verifier si l'utilisateur existe deja
	User.findOne({ email: email })
		.then((user) => {
			if (user)
				return res
					.status(409)
					.json({ message: "Cet utilisateur a deja un compte" });
			else {
				//haschage du password et creation de l'utilisateur dans la bdd
				bcrypt
					.hash(password, 10)
					.then((hash) => {
						const user = new User({
							nom: nom,
							tel: tel,
							email: email,
							password: hash,
							created_at: new Date().toDateString(),
						});
						user.save()
							.then(() => {
								res.status(201).json({
									message: "Compte créé avec success",
									status: "ok",
								});
							})
							.catch((error) => {
								res.status(500).json({
									message:
										"Erreur lors de la création de votre compte ",
								});
							});
					})
					.catch((error) => {
						res.status(500).json({ error });
					});
			}
		})
		.catch((error) => {
			res.status(500).json({ error });
		});
};

//methode login
exports.login = async (req, res, next) => {
	//recuperer les champs dans des variables
	const login = req.body.login;
	const password = req.body.password;

	let user;
	//verifier les données obligatoires
	if (login == null || password == null) {
		return res
			.status(400)
			.json({ message: "Paramètre obligatoire requis" });
	}
	//true = email || false = number
	if (isNaN(login)) {
		const EMAIL_REGEX =
			/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		if (!EMAIL_REGEX.test(login))
			return res.status(400).json({ message: "Entrer un email valide" });
		user = await User.findOne({ email: login });
	} else {
		if (login.length <= 7)
			return res.status(400).json({
				message: "Entrez un numero de téléphone valide",
			});
		user = await User.findOne({ tel: login });
	}

	if (!user) {
		return res.status(400).json({ message: "Informations incorrectes " });
	}
	bcrypt
		.compare(password, user.password)
		.then((valid) => {
			if (!valid) {
				return res.status(400).json({
					message: "Informations incorrectes ",
				});
			}
			res.status(200).json({
				userId: user._id,
				token: jwt.sign({ userId: user._id }, "RANDOM_TOKEN_SECRET", {
					expiresIn: "24h",
				}),
				status: "ok",
			});
		})
		.catch((error) => {
			res.status(500).json({ error });
		});
};

//la methode update
exports.update = (req, res, next) => {
	if (req.body.nom && (req.body.nom.length <= 3 || req.body.nom.length >= 31))
		return res
			.status(400)
			.json({ message: "Entrez un nom valide (plus de 3 caractères)" });

	//verifier l'email
	const EMAIL_REGEX =
		/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	if (req.body.email && !EMAIL_REGEX.test(req.body.email))
		return res.status(400).json({ message: "Entrer un email valide" });

	//verifier le tel
	if (req.body.tel && req.body.tel.length <= 8)
		return res.status(400).json({
			message: "entrez un numero de telephone valide",
		});

	if (req.body.nom || req.body.email || req.body.tel) {
		const thingObject = req.body;
		User.findOne({ _id: req.params.id })
			.then((user) => {
				User.updateOne(
					{ _id: req.params.id },
					{
						...thingObject,
						_id: req.params.id,
						created_at: new Date().toDateString(),
					}
				)
					.then(() => {
						res.status(201).json({
							message: "Profil modifié avec succes",
						});
					})
					.catch((error) => {
						res.status(400).json({ error });
					});
			})
			.catch((error) => {
				res.status(400).json({ error });
			});
	}
};

//la methode get/:id
exports.show = (req, res, next) => {
	User.findOne({ _id: req.params.id })
		.then((user) => {
			res.status(200).json({
				nom: user.nom,
				tel: user.tel,
				email: user.email,
			});
		})
		.catch((error) => {
			res.status(400).json({ error });
		});
};

//la methode updatePassword
exports.updatePassword = (req, res, next) => {
	//recuperer les champs dans des variables
	const currentPassword = req.body.currentPassword;
	const newPassword = req.body.newPassword;

	//verifier les données obligatoires
	if (!currentPassword || !newPassword) {
		return res
			.status(400)
			.json({ message: "Paramètre obligatoire requis" });
	}

	//verifier le password
	if (newPassword.length <= 7)
		return res.status(400).json({
			message:
				"Entrez un nouveau mot de passe valide avec plus de 7 caractères",
		});

	User.findOne({ _id: req.params.id })
		.then((user) => {
			//comparer le current password avec le mot de passe utilisateur en bd
			bcrypt
				.compare(currentPassword, user.password)
				.then((valid) => {
					if (!valid) {
						return res.status(400).json({
							message: "Mot de passe actuel incorect ",
						});
					}
					//haschage du password et creation de l'utilisateur dans la bdd
					bcrypt
						.hash(newPassword, 10)
						.then((hash) => {
							User.updateOne(
								{ _id: req.params.id },
								{
									password: hash,
									_id: req.params.id,
									created_at: new Date().toDateString(),
								}
							)
								.then(() => {
									res.status(201).json({
										message:
											"Mot de passe modifié avec succes",
									});
								})
								.catch((error) => {
									res.status(400).json({ error });
								});
						})
						.catch((error) => {
							res.status(500).json({ error });
						});
				})
				.catch((error) => {
					res.status(500).json({ error });
				});
		})
		.catch((error) => {
			res.status(400).json({ error });
		});
};

//la methode DELETE
exports.delete = (req, res, next) => {
	const password = req.params.password;

	User.findOne({ _id: req.params.id }).then(async (user) => {
		if (user) {
			let valid = await bcrypt.compare(password, user.password);
			if (!valid)
				return res
					.status(400)
					.json({ message: "mot de passe incorect" });
			User.deleteOne({ _id: req.params.id })
				.then(() => {
					res.status(200).json({
						message: " Compte Supprimé avec succcèes",
					});
				})
				.catch((error) => {
					res.status(500).json({ error });
				});
		} else {
			res.status(400).json({
				message: " Compte déja Supprimé",
			});
		}
	});
};

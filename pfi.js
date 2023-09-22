/**
 * Programme pour gerer,modifier,ajouter des utilisateurs de la BD en se connectant
 * dans le cadre de la pfi
 * Redgy Pérard- 30 aout 2023
 */
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const expressLayouts = require("express-ejs-layouts");
const passport = require("passport");
const flash = require("connect-flash");
const session = require("express-session");
const multer = require("multer");
const upload = multer({dest: "./uploads"});

const PORT = 8000;

const storage = multer.diskStorage({
  destination: function(req,file,callback) {
    callback(null, "./uploads");
  },
  filename: function(req, file, callback) {
    callback(null,file.fieldname);
  }
});

app.use(upload.any())

require("./config/passport")(passport);

mongoose.set("strictQuery", false);
mongoose.connect(
  "mongodb+srv://Redgy:perard22@servicesdev1.g6on3lk.mongodb.net/web2_PFI"
);
const db = mongoose.connection;
db.on("error", (err) => {
  console.log("Erreur de BD:", err);
});
db.once("open", () => {
  console.log("Connexion de la BD");
});

//Configuration d'express et des intergiciels

app.use(expressLayouts);

app.use("/css", express.static("./statiques/css"));
app.use("/js", express.static("./statiques/js"));
app.use("/images", express.static("./statiques/images"));

//interpreteur express sur le form recu en post
app.use(express.urlencoded({ extended: true }));

//configuration session express, variable de session
app.use(session({secret: "un mot secret", resave: true, saveUninitialized: true }));

//l'intergiciel (middleware) passport
app.use(passport.initialize());
app.use(passport.session());

//flash
app.use(flash());

app.use(
  function (req, rep, next) {
  rep.locals.success_msg = req.flash("success_msg");
  rep.locals.error_msg = req.flash("error_msg");
  rep.locals.error = req.flash("error");
  next();
});

app.use("/", require("./routes/index"));

app.set("views", "./views");
app.set("view engine", "ejs");

app.listen(PORT, console.log(`Serveur Web fonctionnel sur le port ${PORT}`));

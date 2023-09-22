//Permet l'utilisation du bycrypt, passport local et obtenir les infos de la BD

const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

const Usagers = require("../modeles/Usagers");

module.exports = function (passport) {
  passport.use(
    new LocalStrategy({usernameField: "email"},(email, password, done) => {
        //recherche dans la bd
        Usagers.findOne({"email": email})
        .then(usager => {
          if (!usager) {
            return done(null, false, { message: "Ce courriel n existe pas"});
          }
          //usager trouver
          bcrypt.compare(password, usager.password, (err,sontEgaux)=>{
            if(err) throw err;
            if (sontEgaux) {
              return done(null, usager);
            }
            else {
              return done(null, false, {message: "Ce mot de passe est invalide" });
            }
          });
          
        })
      })
  );
  passport.serializeUser(
    function (user, done) { done(null, user.email)}
    );

  passport.deserializeUser(
    function (email, done) {
    Usagers.findOne({"email": email})
      .then(usager => done(false, usager))
      .catch(err => done(err, false));
  });
};

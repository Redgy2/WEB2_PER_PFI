//authentification pour savoir si le user est loger, admin ou gestion

module.exports = {
    estAuthentifie: function(req,rep,next) {
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash("error_msg","Connectez-vous pour acceder au site");
        rep.redirect("/usagers/login");
    },
    estAdmin: function(req,rep,next){
        if (req.isAuthenticated()) {
            let admin = req.user.roles.includes("admin");
            if (admin) {
                return next();
            } else {
                req.flash("error_msg","Vous devez etre admin pour avoir acces");
                rep.redirect("/index");
            }
        }
    },
    estGestion: function(req,rep,next){
        if (req.isAuthenticated()) {
            let gestion = req.user.roles.includes("gestion");
            if (gestion) {
                return next();
            } else {
                req.flash("error_msg","Vous devez etre dans gestion pour avoir acces");
                rep.redirect("/index");
            }
        }
    },

}
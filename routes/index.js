//Page pour créer les routes qui guident vers les pages et enregistrer les post

const express = require("express");

const bcrypt = require("bcryptjs");

const passport = require("passport");

const Usagers = require("../modeles/Usagers");

const Livres = require("../modeles/Livres");

const {estAuthentifie,estAdmin,estGestion} = require("../config/auth");

const mongoose  = require("mongoose");

const nodeJSPath = require("path");
const { error } = require("console");

const fs = require("fs").promises;

const router = express.Router();


router.get("/livres/ajouter", estGestion, (requete, reponse) => {
  reponse.render("ajoutLivres", {
    
  });
});


router.get("/livres/supprimer/:nom",estGestion, (requete,reponse)=> {
  const livre = requete.user;
  const nom = requete.params.nom
  Livres.deleteOne({"nom":nom})
  .exec()
  .then(resultat=>{
    console.log(resultat);
    reponse.redirect("/livres/")
  })
  .catch(err=>console.log(err));

});




router.get("/livres/",estAuthentifie, (requete, reponse) => {
  const livre = requete.user;
  Livres.find({}).exec()
  .then(livres=>{
  reponse.render("listeLivres", {
    "titre": "Page liste des usagers",
      livre: livre,
      "listeLivres": livres
  });
  })
  .catch(err=>{throw err})
});

router.get("/livres/editer/:nom",estGestion, (requete,reponse)=> {
  const livre = requete.user;
  const nom = requete.params.nom
  Livres.findOne({"nom": nom})
  .then(monLivre=>{
    reponse.render("modifLivres", {
      "titre": "Modifier livre",
      livre: livre,
      nom: monLivre.nom,
      auteur: monLivre.auteur,
      langue: monLivre.langue,
      nbPages: monLivre.nbPages,
      price: monLivre.price,
      description: monLivre.description,
      url: monLivre.url,
      edition: monLivre.edition, 
      prix: monLivre.prix   
  });
  })
  .catch(err=>{
    console.log(err);
    requete.flash("error_msg", "Erreur contacter l admin");
    reponse.redirect("/index");
  }) 
})



router.post("/userLivres", estGestion, (requete, reponse) => {
  const {nom,auteur,langue,edition,nbPages,prix,description,url} = requete.body;
  let erreurs = [];
   if (!nom || !auteur || !langue || !edition || !nbPages || !prix || !description) {
    erreurs.push({msg: "Remplir toutes les cases obligatoirement, sauf URL"});
   }
   if (prix < 0) {
    erreurs.push({msg: "Le prix ne peut pas etre négatifs"});
   }
   if (nbPages < 0) {
    erreurs.push({msg: "Les pages ne peut pas etre négatifs"});
   }
   if (erreurs.length > 0) {
    reponse.render("ajoutLivres", {
      errors: erreurs,
      nom,
      auteur,
      langue,
      edition,
      nbPages,
      prix,
      description,
      url
    });
   } else {
      Livres.findOne({"nom":nom})
      .then(livre=>{
        if (livre) { //titre est deja dans la BD on rejette l'ajout
          erreurs.push({msg:"Ce titre existe deja"});
          reponse.render("ajoutLivres", {
            errors: erreurs,
            nom,
            auteur,
            langue,
            edition,
            nbPages,
            prix,
            description,
            url
          });
        } else {
          let _id = new mongoose.Types.ObjectId();
          const nouveauLivre = new Livres({_id,nom,auteur,langue,edition,nbPages,prix,description,url})
          nouveauLivre.save()
                .then(livre=>{
                  requete.flash("success_msg","Nouveau livre ajouté");
                  reponse.redirect("/index");
                })
                .catch(err=>console.log("insertion na pas marche ", err));
                  
                  
        }
      })
   }
});

router.post("/livreModif", estGestion, (requete, reponse) => {
  const {nom,auteur,langue,edition,nbPages,prix,description,url} = requete.body;
  let erreurs = [];
 
   if (!nom ) {
    erreurs.push({msg: "Remplir le nom"});
   }
  
  if (prix < 0) {
   erreurs.push({msg: "Le prix ne peut pas etre négatifs"});
  }
  if (nbPages < 0) {
   erreurs.push({msg: "Les pages ne peut pas etre négatifs"});
  }

   if (erreurs.length > 0) {
    reponse.render("modifLivres", {
      errors: erreurs,
      nom,
      auteur,
      langue,
      edition,
      nbPages,
      prix,
      description,
      url,
     
  })
   } 
   else {
    const nouveauLivre = {auteur:auteur,langue:langue,nom:nom,edition:edition,prix:prix,description:description,nbPages:nbPages,url:url};
    Livres.findOneAndUpdate({nom:nom}, nouveauLivre)
    .then(doc=>{
                  requete.flash("success_msg","Livre modifié");
                  reponse.redirect("/index");
                })
                .catch(err=>console.log("modification dans la bd", err));
      };
  });
   
  

  router.post("/userModif", estAdmin, (requete, reponse) => {
    const {nom,email,admin,gestion} = requete.body;
    let erreurs = [];
    let roles = ["normal"];
    if (admin) {
      roles.push("admin");
    }
    if (gestion) {
      roles.push("gestion");
    }
  
     if (!nom ) {
      erreurs.push({msg: "Remplir le nom"});
     }
     if (erreurs.length > 0) {
      reponse.render("modifUsagers", {
        "titre": "Modifier usager",
        errors: erreurs,
        nom,
        email,
        admin,
        gestion,
        emailREADONLY: true
    });
     } 
     else {
      const nouveauUsager = {nom:nom,roles:roles};
      Usagers.findOneAndUpdate({email:email}, nouveauUsager)
      .then(doc=>{
                    requete.flash("success_msg","Usager modifié");
                    reponse.redirect("/index");
                  })
                  .catch(err=>console.log("modification dans la bd", err));
        };
    });
       






router.get("/usagers/login", (requete, reponse) => {
  reponse.render("login", {
    titre: "Identification de l/usager",
  });
});

router.post("/userLogin", (requete, reponse, next) => {
  passport.authenticate("local", {
    successRedirect: "/index",
    failureRedirect: "/usagers/login",
    failureFlash: true,
  })(requete, reponse, next);
});

router.get("/index",estAuthentifie,(requete, reponse) => {
  const usager = requete.user;
  reponse.render("index", {
    "usager": usager
  });
});

router.get("/usagers/logout",estAuthentifie, (requete, reponse,next) => {
  requete.logout(function(err){
    if (err) {
      return next(err);
    }
  });
  requete.flash("success_msg", "Vous etes deconnectés");
  reponse.redirect("login");
});

router.get("/usagers/menu",estAdmin, (requete, reponse) => {
  const usager = requete.user;
  Usagers.find({}).exec()
  .then(usagers=>{
    reponse.render("listeUsagers", {
      "titre": "Page liste des usagers",
      usager: usager,
      "listeUsagers": usagers
    });
  })
  .catch(err=>{throw err})
  
});




router.get("/usagers/ajouter", estAdmin,(requete, reponse) => {
  reponse.render("ajoutUsagers", {
    "titre": "Ajout usagers"
  });
});



router.post("/userAdd", estAdmin, (requete, reponse) => {
  const {nom,email,password,password2,admin,gestion} = requete.body;
  const { originalname, destination, filename, size, path, mimetype } = requete.files[0];
  const mimetypePermis = ["image/jpeg","image/png","image/jpg","image/gif","image/webp",]
  const maxFileSize = 1024 * 1024 * 2;
  let erreurs = [];
  let roles = ["normal"];
  if (admin) {
    roles.push("admin");
  }
  if (gestion) {
    roles.push("gestion");
  }

  if (size > maxFileSize) {
    erreurs.push({msg: `La taille du fichier est trop grande (max ${maxFileSize})`})
  } else {
    if (!mimetypePermis.includes(mimetype)) {
      erreurs.push({msg: "Format de fichier non permis"})
    }
  }

   if (!nom || !email || !password || !password2 ) {
    erreurs.push({msg: "Remplir toutes les cases"});
   }
   if (password !== password2) {
    erreurs.push({msg: "Les mots de passes ne correspondent pas"});
   }
   if (password.length < 4) {
    erreurs.push({msg: "Mot de passe doit avoir 4 caracteres minimum"});
   }
   if (erreurs.length > 0) {
    supprimerFichier(path);
    reponse.render("ajoutUsagers", {
      "titre": "Ajout usagers",
      errors: erreurs,
      nom, 
      email,
      password,
      password2,
      admin,
      gestion
    });
   } else {
      Usagers.findOne({"email":email})
      .then(usager=>{
        if (usager) { //usager est deja dans la BD on rejette l'ajout
          erreurs.push({msg:"Ce courriel existe deja"});
          supprimerFichier(path);
          reponse.render("ajoutUsagers", {
            "titre": "Ajout usagers",
            errors: erreurs,
            nom, 
            email,
            password,
            password2,
            admin,
            gestion
          });
        } else {
          let _id = new mongoose.Types.ObjectId();
          const nouveauUsager = new Usagers({_id,nom,email,password,roles});
          //hachage
          bcrypt.genSalt(10,(err,salt)=>{
            if (err) throw err;
            bcrypt.hash(nouveauUsager.password, salt, (err,hash)=>{
              if(err) throw err;
                nouveauUsager.password = hash;
                conserverFichier(path,filename);
                nouveauUsager.nomImage = filename;
                nouveauUsager.save()
                .then(usager=>{
                  requete.flash("success_msg","Nouvel usager ajouté");
                  reponse.redirect("/index");
                })
                .catch(err=>console.log("insertion na pas marche ", err));
            });      
          });        
        }
      })
   }
});


router.get("/usagers/editer/:email",estAuthentifie, (requete,reponse)=> {
  const usager = requete.user;
  const email = requete.params.email
  Usagers.findOne({"email": email})
  .then(monUsager=>{
    //usager trouver dans bd on l'affiche
    const admin = monUsager.roles.find(elem=>elem=="admin");
    const gestion = monUsager.roles.find(elem=>elem=="gestion");
    reponse.render("modifUsagers", {
      "titre": "Modifier usager",
      usager: usager,
      nom: monUsager.nom,
      email: monUsager.email,
      admin: admin,
      gestion: gestion,
      emailREADONLY: true
  });
  })
  .catch(err=>{
    console.log(err);
    requete.flash("error_msg", "Erreur contacter l admin");
    reponse.redirect("/index");
  }) 
})

router.get("/usagers/editerPWD/:email",estAuthentifie, (requete,reponse)=> {
  const usager = requete.user;
  const email = requete.params.email
  Usagers.findOne({"email": email})
  .then(monUsager=>{
    //usager trouver dans bd on l'affiche
    reponse.render("modifPWD", {
      "titre": "Modifier password",
      usager: usager,
      email: monUsager.email,
      password: monUsager.password,
      emailREADONLY: true
  });
  })
  .catch(err=>{
    console.log(err);
    requete.flash("error_msg", "Erreur contacter l admin");
    reponse.redirect("/index");
  }) 
})

router.get("/usagers/editerImage/:email",estAuthentifie, (requete,reponse)=> {
  const usager = requete.user;
  const email = requete.params.email
  Usagers.findOne({"email": email})
  .then(monUsager=>{
    //usager trouver dans bd on l'affiche
    reponse.render("modifImages", {
      "titre": "Modifier image",
      usager: usager,
      email: monUsager.email,
      nomImage: monUsager.nomImage,
      emailREADONLY: true
  });
  })
  .catch(err=>{
    console.log(err);
    requete.flash("error_msg", "Erreur contacter l admin");
    reponse.redirect("/index");
  }) 
})

  
   
  router.post("/userImg", estAdmin, (requete, reponse) => {
    const {email} = requete.body;
    const { originalname, destination, filename, size, path, mimetype } = requete.files[0];
    const mimetypePermis = ["image/jpeg","image/png","image/jpg","image/gif","image/webp",]
    const maxFileSize = 1024 * 1024 * 2;
          let erreurs = [];
          if (size > maxFileSize) {
            erreurs.push({msg: `La taille du fichier est trop grande (max ${maxFileSize})`})
          } else {
            if (!mimetypePermis.includes(mimetype)) {
              erreurs.push({msg: "Format de fichier non permis"})
            }
          }
           if (erreurs.length > 0) {
            reponse.render("modifImages", {
              "titre": "Modifier image",
              errors: erreurs,
              email,
              emailREADONLY: true
          });
           } 
           else {
            const nouveauUsager = {nomImage:filename};
            Usagers.findOneAndUpdate({email: email}, nouveauUsager)
            conserverFichier(path,filename)
            .then(doc=>{
                          requete.flash("success_msg","image modifié");
                          reponse.redirect("/index");
                        })
                        .catch(err=>console.log("modification dans la bd", err));
                    };
                });
                 
           
   router.post("/userPass", estAdmin, (requete, reponse) => {
                  const {password,password2,email} = requete.body;
                  let erreurs = [];
                  if (!password || !password2 ) {
                    erreurs.push({msg: "Remplir mot de passe"});
                   }
                   if (password !== password2) {
                    erreurs.push({msg: "Les mots de passes ne correspondent pas"});
                   }
                   if (password.length < 4) {
                    erreurs.push({msg: "Mot de passe doit avoir 4 caracteres minimum"});
                   }
                   if (erreurs.length > 0) {
                    reponse.render("modifPWD", {
                      "titre": "Modifier mdp",
                      errors: erreurs,
                      email,
                      password,
                      password2,
                      emailREADONLY: true
                  });
                   } 
                   else {
                    const nouveauUsager = {password:password};
                    Usagers.findOneAndUpdate({email:email}, nouveauUsager)
                    .then(doc=>{
                                  requete.flash("success_msg","Mot de passe modifié");
                                  reponse.redirect("/index");
                                })
                                .catch(err=>console.log("modification dans la bd", err));
                            };
         });
                         
                   
  

router.get("/usagers/supprimer/:email",estAuthentifie, (requete,reponse)=> {
  const usager = requete.user;
  const email = requete.params.email
  Usagers.deleteOne({"email":email})
  .exec()
  .then(resultat=>{
    console.log(resultat);
    reponse.redirect("/usagers/menu")
  })
  .catch(err=>console.log(err));

});



router.get("*",(requete, reponse) => {
  reponse.render("login", {
    titre: "Identification de l/usager",
  });
});


/**
 * fonction deplace le fichier a conserver dans le repertoire statiques/images et retourne le nom
 * @param {*} nomFichier fichier a deplacer avec son chemin
 * @param {*} filename  nom du fichier a conserver
 * @returns retourne nom fichier
 */
const conserverFichier= async (nomFichier,filename) => {
  const nomFichierComplet = nodeJSPath.join(__dirname, "..", nomFichier);
  const nouveauNom = nodeJSPath.join(__dirname, "..", "statiques","images",filename);
  try {
    await fs.rename(nomFichierComplet,nouveauNom);
  } catch (e) {
    console.log(e);
  }
  return filename;
}

/**
 * Supprimer image lorsqu'on reload la page
 * @param {*} nomFichier nom du fichier a supprimer
 */
async function supprimerFichier(nomFichier){
    const nomFichierComplet = nodeJSPath.join(__dirname, "..", nomFichier);
    try {
      await fs.rm(nomFichierComplet);
    } catch (e) {
      console.log(e);
    }
}
module.exports = router;

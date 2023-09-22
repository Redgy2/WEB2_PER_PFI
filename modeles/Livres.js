// schéma de données pour les livres
//authentification des livres
// Redgy Pérard

const mongoose = require("mongoose");

let schemaLivres = mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  nom: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  auteur: {
    type: String,
    required: true,
  },
  nbPages: {
    type: Number,
    required: true,
  },
  langue: {
    type: String,
    required: true,
  },
  prix: {
    type: Number,
    required: true,
  },
  edition: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
    default: "https://media.istockphoto.com/id/937221630/vector/green-vintage-book-with-lock.jpg?s=1024x1024&w=is&k=20&c=jLxArC88gMoO7M-7OrD7mjyITMn4WfKU13-6JwzKIKo="
  },
});

let Livres = (module.exports = mongoose.model("livres", schemaLivres));

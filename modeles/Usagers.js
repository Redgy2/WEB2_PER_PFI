// schéma de données pour les usagers
//authentification des usagers
// Redgy Pérard

const mongoose = require("mongoose");

let schemaUsagers = mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  nom: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  roles: {
    type: Array,
    required: true,
    default:["normal"]
  },
  nomImage: {
    type: String,
    required: true,
    default: "download.png"
  },
});

let Usagers = (module.exports = mongoose.model("usagers", schemaUsagers));

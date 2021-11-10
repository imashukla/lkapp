const mongoose = require("mongoose");

const levelSchema = new mongoose.Schema(
  {
    name: String,
    type: String,
    rupee: Number, //rupee as coin
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Level", levelSchema);

const mongoose = require("mongoose");

const redeemSchema = new mongoose.Schema(
  {
    agency_id: { type: mongoose.Schema.Types.ObjectId, ref: "Agency" },
    paymentGateway: String,
    description: String,
    coin: Number,
    image: String,
    decline: { type: Boolean, default: false },
    accepted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AgencyRedeem", redeemSchema);

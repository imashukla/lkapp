const mongoose = require("mongoose");

const redeemSchema = new mongoose.Schema(
  {
    host_id: { type: mongoose.Schema.Types.ObjectId, ref: "Host" },
    agency_id: { type: mongoose.Schema.Types.ObjectId, ref: "Agency" },
    paymentGateway: String,
    description: String,
    coin: Number,
    image: String,
    accepted: { type: Boolean, default: false },
    decline: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Redeem", redeemSchema);

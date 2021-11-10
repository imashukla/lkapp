const mongoose = require("mongoose");

const agencySchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    image: String,
    code: Number,
    mobileNo: String,
    redeemCoin: { type: Number, default: 0 },
    totalCoin: { type: Number, default: 0 },
    isDisable: { type: Boolean, default: false },
    flag: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Agency", agencySchema);

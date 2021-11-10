const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isAccepted: { type: Boolean, default: false },
    agencyId: { type: mongoose.Schema.Types.ObjectId, ref: "Agency" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Request", requestSchema);

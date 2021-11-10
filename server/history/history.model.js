const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    host_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Host",
      default: null,
    },
    coin: { type: Number, default: 0 },
    rupee: { type: Number, default: 0 },
    plan_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("History", historySchema);

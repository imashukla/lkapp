const mongoose = require("mongoose");

const callHistorySchema = new mongoose.Schema(
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
    time: { type: Number, default: 0 },
    type: { type: String, default: null }, //outgoing
    gift: Array,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CallHistory", callHistorySchema);

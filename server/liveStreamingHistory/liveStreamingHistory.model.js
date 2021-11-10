const mongoose = require("mongoose");

const liveStreamingHistorySchema = new mongoose.Schema(
  {
    host_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Host",
      default: null,
    },
    hostTotalCoin: { type: Number, default: 0 },
    coin: { type: Number, default: 0 },
    time: { type: Number, default: 0 },
    gift: { type: Number, default: 0 },
    user: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "LiveStreamingHistory",
  liveStreamingHistorySchema
);

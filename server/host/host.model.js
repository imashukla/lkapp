const mongoose = require("mongoose");

const hostSchema = new mongoose.Schema(
  {
    name: String,
    image: String,
    username: String,
    hostId: String,
    password: String,
    bio: { type: String, default: null },
    coin: { type: Number, default: 0 },
    followers_count: { type: Number, default: 0 },
    following_count: { type: Number, default: 0 },
    fcm_token: { type: String, default: null },
    block: { type: Boolean, default: false },
    country: { type: String, default: "India" },
    hostCountry: { type: mongoose.Schema.Types.ObjectId, ref: "Country" }, //get country when host is live

    isLogout: { type: Boolean, default: false },
    isOnline: { type: Boolean, default: false },
    isLive: { type: Boolean, default: false },
    isBusy: { type: Boolean, default: false },

    token: { type: String, default: null },
    channel: { type: String, default: null },

    mobileNo: { type: String, default: "" },
    receivedCoin: { type: Number, default: 0 },

    IPAddress: { type: String, default: null },
    agencyId: { type: mongoose.Schema.Types.ObjectId, ref: "Agency" },
    uniqueId: String,
    bonusSwitch: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Host", hostSchema);

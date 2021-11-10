const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: String,
    image: String,
    username: String,
    identity: String,
    bio: { type: String, default: null },
    coin: { type: Number, default: 0 },
    followers_count: { type: Number, default: 0 },
    following_count: { type: Number, default: 0 },
    fcm_token: String,
    block: { type: Boolean, default: false },
    country: String,
    dailyTaskDate: { type: String },
    dailyTaskFinishedCount: { type: Number, default: 0 },

    isLogout: { type: Boolean, default: false },
    isOnline: { type: Boolean, default: false },
    isVIP: { type: Boolean, default: false },
    plan_id: { type: mongoose.Schema.Types.ObjectId, default: null },
    plan_start_date: { type: String, default: null },

    isHost: { type: Boolean, default: false },
    thumbImage: String,
    token: { type: String, default: null },
    channel: { type: String, default: null },

    type: { type: String, enum: ["mobile", "fb", "google", "quick"] },
    mobileNo: { type: String, default: "" },
    gender: { type: String, default: "MALE" },

    spendCoin: { type: Number, default: 0 }, //spend coin by user

    IPAddress: String,
    uniqueId: String,

    lastLoginDate: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);

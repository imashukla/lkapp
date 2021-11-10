const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    host_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Host",
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    message: String,
    sender: String,
    topic: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Chat", chatSchema);

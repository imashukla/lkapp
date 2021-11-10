const mongoose = require("mongoose");

const chatTopicSchema = new mongoose.Schema(
  {
    host_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Host",
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }, //receiver id
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ChatTopic", chatTopicSchema);

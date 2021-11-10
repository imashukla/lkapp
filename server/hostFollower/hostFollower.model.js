const mongoose = require("mongoose");

//following
const hostFollowerSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    host_id: { type: mongoose.Schema.Types.ObjectId, ref: "Host" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("HostFollower", hostFollowerSchema);

const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    host_id: { type: mongoose.Schema.Types.ObjectId, ref: "Host" },
    agency_id: { type: mongoose.Schema.Types.ObjectId, ref: "Agency" },
    description: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Report", reportSchema);

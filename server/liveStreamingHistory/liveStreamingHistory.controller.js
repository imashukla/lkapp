const LiveStreamingHistory = require("./liveStreamingHistory.model");
const Host = require("../host/host.model");

//create live streaming history when host is live
exports.store = async (req, res) => {
  try {
    if (req.body.host_id) {
      const isHostExist = await Host.findById(req.body.host_id);
      if (!isHostExist)
        return res
          .status(200)
          .json({ status: false, message: "Host does not Exist!!" });

      const liveStreamingHistory = new LiveStreamingHistory();

      liveStreamingHistory.host_id = req.body.host_id;
      liveStreamingHistory.hostTotalCoin = isHostExist.coin;

      await liveStreamingHistory.save();

      return res.status(200).json({
        status: true,
        message: "Success!!",
        liveStreamingId: liveStreamingHistory._id,
      });
    } else {
      return res
        .status(200)
        .json({ status: false, message: "Host Id is Required!!" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//start streaming
exports.startStreaming = async (req, res) => {
  try {
    if (req.body.liveStreamingId && req.body.time) {
      const liveStreamingHistory = await LiveStreamingHistory.findById(
        req.body.liveStreamingId
      );
      debugger;
      if (!liveStreamingHistory)
        return res
          .status(200)
          .json({ status: false, message: "Live Streaming Id not Found!!" });

      const host = await Host.findById(liveStreamingHistory.host_id);
      if (!host)
        return res
          .status(200)
          .json({ status: false, message: "Host does not Exist!!" });

      liveStreamingHistory.coin =
        host.coin - liveStreamingHistory.hostTotalCoin;
      if (req.body.time) {
        liveStreamingHistory.time = parseInt(req.body.time);
      }
      if (req.body.gift) {
        liveStreamingHistory.gift = req.body.gift;
      }
      if (req.body.user) {
        liveStreamingHistory.user = req.body.user;
      }

      await liveStreamingHistory.save();

      return res.status(200).json({
        status: true,
        message: "Success!!",
        liveStreamingId: liveStreamingHistory._id,
      });
    } else {
      return res
        .status(200)
        .json({ status: false, message: "Invalid Details!!" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

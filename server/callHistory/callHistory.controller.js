const CallHistory = require("./callHistory.model");
const User = require("../user/user.model");
const Host = require("../host/host.model");
const arraySort = require("array-sort");

//create call history when user or host do call
exports.store = async (req, res) => {
  try {
    if (req.body.user_id && req.body.host_id && req.body.type) {
      const isUserExist = await User.findById(req.body.user_id);
      if (!isUserExist)
        return res
          .status(200)
          .json({ status: false, message: "User does not Exist!!" });

      const isHostExist = await Host.findById(req.body.host_id);
      if (!isHostExist)
        return res
          .status(200)
          .json({ status: false, message: "Host does not Exist!!" });

      const callHistory = new CallHistory();

      callHistory.type = req.body.type.trim().toLowerCase();
      callHistory.user_id = req.body.user_id;
      callHistory.host_id = req.body.host_id;

      await callHistory.save();

      return res
        .status(200)
        .json({ status: true, message: "Success!!", callId: callHistory._id });
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

//receive call
exports.receiveCall = async (req, res) => {
  try {
    if (req.body.callId && req.body.coin) {
      const callHistory = await CallHistory.findById(req.body.callId);

      if (!callHistory)
        return res
          .status(200)
          .json({ status: false, message: "Call Id not Found!!" });

      const user = await User.findById(callHistory.user_id);
      if (!user)
        return res
          .status(200)
          .json({ status: false, message: "User does not Exist!!" });

      if (user.coin < parseInt(req.body.coin)) {
        return res
          .status(200)
          .json({ status: false, message: "Insufficient Coin." });
      }

      user.coin -= parseInt(req.body.coin);
      user.spendCoin += parseInt(req.body.coin);
      await user.save();

      const host = await Host.findById(callHistory.host_id);
      if (!host)
        return res
          .status(200)
          .json({ status: false, message: "Host does not Exist!!" });
      host.coin += parseInt(req.body.coin);
      host.receivedCoin += parseInt(req.body.coin);
      await host.save();

      callHistory.coin += parseInt(req.body.coin);
      if (req.body.time) {
        callHistory.time += parseInt(req.body.time);
      }
      if (req.body.gift) {
        callHistory.gift.push(req.body.gift);
      }

      await callHistory.save();

      return res
        .status(200)
        .json({ status: true, message: "Success!!", callId: callHistory._id });
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

//user call history
exports.userCallHistory = async (req, res) => {
  try {
    if (!req.query.user_id)
      return res
        .status(200)
        .json({ status: false, message: "User Id is Required!" });
    const callHistory = await CallHistory.find({
      user_id: req.query.user_id,
    }).populate("host_id", "image name");

    const history = await callHistory.map((data) => ({
      _id: data._id,
      user_id: data.user_id,
      host_id: data.host_id._id,
      image: data.host_id ? data.host_id.image : "",
      name: data.host_id ? data.host_id.name : "",
      coin: data.coin,
      date: data.createdAt,
      time:
        data.time < 60
          ? data.time + " Sec"
          : Math.floor((data.time % 3600) / 60) + " Min",
      type:
        data.type === "user"
          ? "Outgoing"
          : data.coin === 0 && data.time === 0
          ? "MissedCall"
          : "Incoming",
    }));

    arraySort(history, "date", { reverse: true });

    return res
      .status(200)
      .json({ status: true, message: "Success!!", CallHistory: history });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//host call history
exports.hostCallHistory = async (req, res) => {
  try {
    if (!req.query.host_id)
      return res
        .status(200)
        .json({ status: false, message: "Host Id is Required!" });
    const callHistory = await CallHistory.find({
      host_id: req.query.host_id,
    }).populate("user_id", "image name");

    const history = await callHistory.map((data) => ({
      _id: data._id,
      host_id: data.host_id,
      user_id: data.user_id._id,
      image: data.user_id ? data.user_id.image : "",
      name: data.user_id ? data.user_id.name : "",
      coin: data.coin,
      date: data.createdAt,
      time:
        data.time < 60
          ? data.time + " Sec"
          : Math.floor((data.time % 3600) / 60) + " Min",
      type:
        data.type === "host"
          ? "Outgoing"
          : data.coin === 0 && data.time === 0
          ? "MissedCall"
          : "Incoming",
    }));

    arraySort(history, "date", { reverse: true });

    return res
      .status(200)
      .json({ status: true, message: "Success!!", CallHistory: history });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

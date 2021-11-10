const History = require("./history.model");
const User = require("../user/user.model");
const Host = require("../host/host.model");
const Plan = require("../plan/plan.model");
const Follower = require("../hostFollower/hostFollower.model");
const Notification = require("../notification/notification.model");
const dayjs = require("dayjs");

//FCM
var FCM = require("fcm-node");
var { serverKey } = require("../../util/serverPath");
var fcm = new FCM(serverKey);

//store history when open video, send gift
exports.coinTransaction = async (req, res) => {
  try {
    const user = await User.findById(req.body.user_id);

    if (!user) {
      return res
        .status(200)
        .json({ status: false, message: "user id is not exist" });
    }

    const host = await Host.findById(req.body.host_id);

    if (!host) {
      return res
        .status(200)
        .json({ status: false, message: "host is not exist" });
    }

    if (!req.body || !req.body.coin) {
      return res
        .status(200)
        .json({ status: false, message: "coin is required" });
    }

    if (req.body.user_id === req.body.host_id) {
      if (host) {
        // if (host.coin <= 0 || host.coin < req.body.coin) {
        //   return res
        //     .status(200)
        //     .json({ status: false, message: "You have not enough coin!" });
        // }
        // host.coin = host.coin - parseInt(req.body.coin); //todo:
        // host.save();
      }
    } else {
      if (user) {
        if (user.coin <= 0 || user.coin < req.body.coin) {
          return res
            .status(200)
            .json({ status: false, message: "You have not enough coin!" });
        }

        user.coin = user.coin - parseInt(req.body.coin);
        user.spendCoin = user.spendCoin + parseInt(req.body.coin);

        user.save();
      }

      if (host) {
        host.coin = host.coin + parseInt(req.body.coin);
        host.receivedCoin = host.receivedCoin + parseInt(req.body.coin);
        host.save();
      }
    }

    const history = new History();

    history.user_id = req.body.user_id;
    history.host_id = req.body.host_id;
    history.coin = req.body.coin;

    await history.save();

    return res
      .status(200)
      .json({ status: true, message: "success", user: user });
  } catch (error) {
    console.log(error);
  }
};

//store history when purchase coin
exports.purchaseCoinTransaction = async (req, res) => {
  try {
    const user = await User.findById(req.body.user_id);

    if (!user) {
      return res
        .status(200)
        .json({ status: false, message: "user id is not exist" });
    }

    const PlanExist = await Plan.findById(req.body.plan_id);
    if (!PlanExist) {
      return res
        .status(200)
        .json({ status: false, message: "Plan is not exist" });
    }

    if (user && PlanExist) {
      user.coin = user.coin + parseInt(PlanExist.coin);
      user.save();
    }

    const history = new History();

    history.user_id = req.body.user_id;
    history.coin = PlanExist.coin;
    history.rupee = PlanExist.rupee;
    history.plan_id = req.body.plan_id;

    await history.save();

    const notification = new Notification();

    notification.title = "Coin Purchased";
    notification.description = `You have purchased ${PlanExist.coin} coin amount of ${PlanExist.rupee}.`;
    notification.type = "purchase";
    notification.image = null;
    notification.user_id = req.body.user_id;

    await notification.save();

    const followers = await Follower.find({
      user_id: req.body.user_id,
    }).populate("user_id host_id");

    followers.map(async (data) => {
      const notification = new Notification();

      notification.title = `Hello, ${data.host_id.name} `;
      notification.description = `${user.name} has purchased ${PlanExist.coin} coin.`;
      notification.type = "follow";
      notification.image = user.image;
      notification.host_id = data.host_id._id;

      await notification.save();
      if (data.host_id.isLogout === false && data.host_id.block === false) {
        const payload = {
          to: data.host_id.fcm_token,
          notification: {
            body: `${data.user_id.name} added ${PlanExist.coin} Coins in their Wallet`,
          },
        };

        await fcm.send(payload, function (err, response) {
          if (err) {
            console.log("Something has gone wrong!");
          } else {
            console.log("Successfully sent with response: ", response);
          }
        });
      }
    });

    return res.status(200).json({ status: true, message: "success" });
  } catch (error) {
    console.log(error);
  }
};

exports.getRecharge = async (req, res) => {
  try {
    if (!req.query.user_id) {
      return res
        .status(200)
        .json({ status: false, message: "user id is required" });
    }
    const start = req.query.start ? parseInt(req.query.start) : 0;
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;
    const userHistory = await History.find({
      plan_id: { $exists: true, $ne: null },
    })
      .where({ user_id: req.query.user_id })
      .skip(start)
      .limit(limit)
      .sort({ createdAt: -1 });

    if (!userHistory) {
      return res.status(200).json({ status: false, message: "no data found" });
    }

    const recharge = await userHistory.map((data) => ({
      coin: data.coin,
      rupee: data.rupee,
      date: data.createdAt.toISOString().slice(0, 10),
    }));

    return res
      .status(200)
      .json({ status: true, message: "success", data: recharge });
  } catch (error) {
    console.log(error);
  }
};

exports.getCoinIncome = async (req, res) => {
  try {
    if (!req.query.host_id) {
      return res
        .status(200)
        .json({ status: false, message: "host id is required" });
    }
    const start = req.query.start ? parseInt(req.query.start) : 0;
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;
    const hostHistory = await History.find({
      host_id: req.query.host_id,
    })
      .skip(start)
      .limit(limit)
      .populate("user_id", "username")
      .sort({ createdAt: -1 });

    if (!hostHistory) {
      return res.status(200).json({ status: false, message: "no data found" });
    }

    const recharge = await hostHistory.map((data) => ({
      coin: data.coin,
      person: data.user_id.username,
      date: data.createdAt.toISOString().slice(0, 10),
    }));

    return res
      .status(200)
      .json({ status: true, message: "success", data: recharge });
  } catch (error) {
    console.log(error);
  }
};

exports.getCoinOutCome = async (req, res) => {
  try {
    if (!req.query.user_id) {
      return res
        .status(200)
        .json({ status: false, message: "user id is required" });
    }
    const start = req.query.start ? parseInt(req.query.start) : 0;
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;
    const userHistory = await History.find({
      user_id: req.query.user_id,
    })
      .where({ plan_id: null })
      .skip(start)
      .limit(limit)
      .populate("host_id", "username")
      .sort({ createdAt: -1 });

    if (!userHistory) {
      return res.status(200).json({ status: false, message: "no data found" });
    }

    const recharge = await userHistory.map((data) => ({
      coin: data.coin,
      person: data.host_id.username,
      date: data.createdAt.toISOString().slice(0, 10),
    }));

    return res
      .status(200)
      .json({ status: true, message: "success", data: recharge });
  } catch (error) {
    console.log(error);
  }
};

//for admin
exports.purchaseCoinHistory = async (req, res) => {
  try {
    const history = await History.find({
      plan_id: { $exists: true, $ne: null },
    })
      .populate("user_id", "username")
      .sort({ createdAt: -1 });

    const data = await history.map((data) => ({
      who: data.user_id.username,
      rupee: data.rupee,
      coin: data.coin,
      date: data.createdAt,
      plan_id: data.plan_id,
    }));

    return res.status(200).json({ status: true, message: "success", data });
  } catch (error) {
    console.log(error);
  }
};

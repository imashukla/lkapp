const Host = require("./host.model");
const Follower = require("../userFollower/userFollower.model");
const Notification = require("../notification/notification.model");
const Country = require("../country/country.model");
const History = require("../history/history.model");
const Level = require("../level/level.model");
const Setting = require("../setting/setting.model");
const Agency = require("../agency/agency.model");
const CallHistory = require("../callHistory/callHistory.model");
const LiveStreamingHistory = require("../liveStreamingHistory/liveStreamingHistory.model");
const { deleteFile } = require("../../util/deleteFile");
const fs = require("fs");
const shuffleArray = require("../../util/shuffle");
const { serverPath } = require("../../util/serverPath");
const mongoose = require("mongoose");

//encrypt decrypt
const Cryptr = require("cryptr");
const crypt = new Cryptr("myTotalySecretKey");

//FCM
var FCM = require("fcm-node");
var { serverKey } = require("../../util/serverPath");
var fcm = new FCM(serverKey);

//get list of host
exports.index = async (req, res) => {
  try {
    const host = await Host.find().populate("agencyId").sort({ createdAt: -1 });

    if (!host) {
      throw new Error();
    }

    await host.map((host) => {
      host.password = crypt.decrypt(host.password);
    });

    return res
      .status(200)
      .json({ status: true, message: "Success", data: host });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Server Error",
    });
  }
};

//get agency wise host count and total earning [for main admin]
exports.agencyWiseHostCount = async (req, res) => {
  try {
    const agency = await Agency.find();

    let agencyData = [];
    for (var i = 0; i < agency.length; i++) {
      const count = await Host.find({
        agencyId: agency[i]._id,
      })
        .countDocuments();

      agencyData.push({
        _id: agency[i]._id,
        name: agency[i].name,
        count: count || 0,
        earningCoin: agency[i].totalCoin,
        createdAt: agency[i].createdAt,
        updatedAt: agency[i].updatedAt,
      });
    }

    return res
      .status(200)
      .json({ status: true, message: "Success!!", data: agencyData });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//get list of host agency wise
exports.agencyWiseHost = async (req, res) => {
  try {
    const host = await Host.find({ agencyId: req.params.agency_id })
      .populate("agencyId")
      .sort({ createdAt: -1 });

    if (!host) {
      throw new Error();
    }

    await host.map((host) => {
      host.password = crypt.decrypt(host.password);
    });

    return res
      .status(200)
      .json({ status: true, message: "Success", data: host });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Server Error",
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const host = await Host.findById(req.query.host_id);

    if (!host)
      return res.status(200).json({ status: false, message: "Host not Found" });

    return res.status(200).json({ status: true, message: "Success!!", host });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//create host
exports.store = async (req, res) => {
  try {
    if (!req.body.name) {
      deleteFile(req.file);
      return res
        .status(200)
        .json({ status: false, message: "Name is required." });
    }
    if (!req.file)
      return res
        .status(200)
        .json({ status: false, message: "Please select an Image" });

    if (!req.body.username) {
      deleteFile(req.file);
      return res
        .status(200)
        .json({ status: false, message: "Username is required." });
    }
    if (!req.body.hostId) {
      deleteFile(req.file);
      return res
        .status(200)
        .json({ status: false, message: "host Id is required." });
    }
    if (!req.body.password) {
      deleteFile(req.file);
      return res
        .status(200)
        .json({ status: false, message: "password is required." });
    }
    if (!req.body.bio) {
      deleteFile(req.file);
      return res
        .status(200)
        .json({ status: false, message: "bio is required." });
    }
    if (!req.body.agencyId) {
      deleteFile(req.file);
      return res
        .status(200)
        .json({ status: false, message: "agency Id is required." });
    }

    const isHostExist = await Host.findOne({ hostId: req.body.hostId });

    if (isHostExist)
      return res
        .status(200)
        .json({ status: false, message: "Host Id already Exist!!" });

    const host = new Host();

    host.hostId = req.body.hostId;
    host.password = crypt.encrypt(req.body.password);
    host.name = req.body.name;
    host.image = serverPath + req.file.path;
    host.username = req.body.username;
    host.bio = req.body.bio;
    host.agencyId = req.body.agencyId;
    host.uniqueId =
      Math.floor(Math.random() * (99999999 - 11111111)) + 11111111;

    await host.save();

    const data = await Host.findById(host._id).populate("agencyId");
    data.password = crypt.decrypt(data.password);

    return res
      .status(200)
      .json({ status: true, message: "success", host: data });
  } catch (error) {
    console.log(error);
    deleteFile(req.file);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//update host
exports.update = async (req, res) => {
  try {
    const host = await Host.findById(req.params.host_id);

    if (!host)
      return res
        .status(200)
        .json({ status: false, message: "Host not Found!!" });

    const isHostExist = await Host.findOne({
      _id: { $ne: host._id },
      hostId: req.body.hostId,
    });

    if (isHostExist) {
      if (req.file) {
        deleteFile(req.file);
      }
      return res
        .status(200)
        .json({ status: false, message: "Host Id already Exist!!" });
    }

    host.hostId = req.body.hostId;
    host.password = crypt.encrypt(req.body.password);
    host.name = req.body.name;
    if (req.file) {
      const img = host.image && host.image.split(serverPath)[1];
      if (fs.existsSync(img)) {
        fs.unlinkSync(img);
      }
      host.image = serverPath + req.file.path;
    }
    host.username = req.body.username;
    host.bio = req.body.bio;
    host.agencyId = req.body.agencyId;

    await host.save();

    const data = await Host.findById(host._id).populate("agencyId");
    data.password = crypt.decrypt(data.password);

    return res
      .status(200)
      .json({ status: true, message: "success", host: data });
  } catch (error) {
    console.log(error);
    deleteFile(req.file);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//host login
exports.login = async (req, res) => {
  try {
    if (!req.body.hostId)
      return res
        .status(200)
        .json({ status: false, message: "host Id is required." });

    if (!req.body.password)
      return res
        .status(200)
        .json({ status: false, message: "password is required." });
    if (!req.body.fcmtoken)
      return res
        .status(200)
        .json({ status: false, message: "fcm token is required." });
    if (!req.body.IPAddress)
      return res
        .status(200)
        .json({ status: false, message: "IPAddress is required." });
    if (!req.body.country)
      return res
        .status(200)
        .json({ status: false, message: "country is required." });

    const host = await Host.findOne({
      hostId: req.body.hostId,
    });

    if (!host)
      return res
        .status(200)
        .json({ status: false, message: "Host Id is not Valid!!" });

    if (crypt.decrypt(host.password) !== req.body.password)
      return res
        .status(200)
        .json({ status: false, message: "Password Not match!!" });

    host.fcm_token = req.body.fcmtoken;
    host.IPAddress = req.body.IPAddress;
    host.country = req.body.country;
    host.isLogout = false;
    host.isOnline = false;
    host.isLive = false;
    host.isBusy = false;

    await host.save();

    return res.status(200).json({ status: true, message: "Success!!", host });
  } catch (error) {
    console.log(error);
    deleteFile(req.file);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//block unblock host
exports.blockUnblockHost = async (req, res) => {
  try {
    const host = await Host.findById(req.params.host_id);
    if (!host) {
      return res.status(200).json({ status: false, message: "host not found" });
    }

    host.block = !host.block;
    await host.save();

    return res
      .status(200)
      .json({ status: true, message: "success", data: host });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//host is online
exports.hostIsOnline = async (req, res) => {
  try {
    if (
      req.body.host_id &&
      req.body.token &&
      req.body.channel &&
      req.body.country
    ) {
      const host = await Host.findById(req.body.host_id);

      if (!host) {
        return res
          .status(200)
          .json({ status: false, message: "Host not Found!" });
      }

      const country = await Country.find({
        name: req.body.country.toUpperCase(),
      });

      if (country.length === 0) {
        const country = new Country();
        country.name = req.body.country.toUpperCase();
        await country.save();
        host.hostCountry = country._id;
      } else {
        host.hostCountry = country[0]._id;
      }

      host.isOnline = true;
      host.isBusy = false;
      host.isLive = false;
      host.token = req.body.token;
      host.channel = req.body.channel;

      await host.save();

      return res.status(200).json({ status: true, message: "Success" });
    } else {
      return res
        .status(200)
        .json({ status: false, message: "Invalid Details" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//host is live
exports.hostIsLive = async (req, res) => {
  try {
    if (
      req.body.host_id &&
      req.body.token &&
      req.body.channel &&
      req.body.country
    ) {
      const host = await Host.findById(req.body.host_id);

      if (!host) {
        return res
          .status(200)
          .json({ status: false, message: "Host not Found!" });
      }

      const country = await Country.find({
        name: req.body.country.toUpperCase(),
      });

      if (country.length === 0) {
        const country = new Country();
        country.name = req.body.country.toUpperCase();
        await country.save();
        host.hostCountry = country._id;
      } else {
        host.hostCountry = country[0]._id;
      }

      host.isOnline = false;
      host.isLive = true;
      host.token = req.body.token;
      host.channel = req.body.channel;

      await host.save();

      const followers = await Follower.find({
        host_id: req.body.host_id,
      }).populate("user_id host_id");

      followers.map(async (data) => {
        const notification = new Notification();

        notification.title = `${data.host_id.name} is live`;
        notification.description = data.host_id.username;
        notification.type = "live";
        notification.image = data.host_id.image;
        notification.user_id = data.user_id._id;

        await notification.save();

        if (
          data.from_user_id.isLogout === false &&
          data.from_user_id.block === false
        ) {
          const payload = {
            to: data.from_user_id.fcm_token,
            notification: {
              body: `${data.user_id.name} is Live Now`,
            },
            data: {
              image: host.image,
              host_id: host._id.toString(),
              name: host.name,
              country_id: host.hostCountry.toString(),
              type: "real",
              coin: host.coin.toString(),
              token: host.token,
              channel: host.channel,
              view: "0",
              notificationType: "live",
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

      return res.status(200).json({ status: true, message: "Success" });
    } else {
      return res
        .status(200)
        .json({ status: false, message: "Invalid Details" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//host is offline
exports.hostIsOffline = async (req, res) => {
  try {
    if (req.query.host_id) {
      const host = await Host.findById(req.query.host_id);

      if (!host) {
        return res
          .status(200)
          .json({ status: false, message: "Host not Found!" });
      }

      const country = await Country.findById(host.hostCountry);

      if (country) {
        const host = await Host.find({
          hostCountry: country._id,
          _id: { $ne: req.query.host_id },
        }).countDocuments();

        if (host === 0) {
          const country_ = await Country.findById(country._id);
          if (country_) {
            country_.deleteOne();
          }
        }
      }

      host.isOnline = false;
      host.isLive = false;
      host.isBusy = false;
      host.token = null;
      host.channel = null;
      host.hostCountry = null;

      await host.save();

      return res.status(200).json({ status: true, message: "Success" });
    } else {
      return res
        .status(200)
        .json({ status: false, message: "Invalid Details" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//remove host from live
exports.hostIsUnLive = async (req, res) => {
  try {
    if (req.query.host_id) {
      const host = await Host.findById(req.query.host_id);

      if (!host) {
        return res
          .status(200)
          .json({ status: false, message: "Host not Found!" });
      }

      host.isBusy = false;
      host.isLive = false;

      await host.save();

      return res.status(200).json({ status: true, message: "Success" });
    } else {
      return res
        .status(200)
        .json({ status: false, message: "Invalid Details" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//host is busy (connect call)
exports.hostIsBusy = async (req, res) => {
  try {
    if (req.query.host_id) {
      const host = await Host.findById(req.query.host_id);

      if (!host) {
        return res
          .status(200)
          .json({ status: false, message: "Host not Found!" });
      }

      if (!host.isOnline) {
        return res
          .status(200)
          .json({ status: false, message: "Host is not online!" });
      }

      host.isBusy = true;

      await host.save();

      return res.status(200).json({ status: true, message: "Success" });
    } else {
      return res
        .status(200)
        .json({ status: false, message: "Invalid Details" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//host is free (disconnect call)
exports.hostIsFree = async (req, res) => {
  try {
    if (req.query.host_id) {
      const host = await Host.findById(req.query.host_id);

      if (!host) {
        return res
          .status(200)
          .json({ status: false, message: "Host not Found!" });
      }

      if (!host.isOnline) {
        return res
          .status(200)
          .json({ status: false, message: "Host is not online!" });
      }

      host.isBusy = false;

      await host.save();

      return res.status(200).json({ status: true, message: "Success" });
    } else {
      return res
        .status(200)
        .json({ status: false, message: "Invalid Details" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//random host for match [android]
exports.randomHost = async (req, res) => {
  try {
    const host = await Host.find({
      isOnline: true,
      isBusy: false,
    }).populate("hostCountry");

    if (!host) {
      return res
        .status(200)
        .json({ status: false, message: "Host not Found!" });
    }

    const data = await host.map((host) => ({
      image: host.image,
      host_id: host._id,
      name: host.name,
      country_id: host.hostCountry ? host.hostCountry._id : "",
      country_name: host.hostCountry ? host.hostCountry.name : "",
      isBusy: host.isBusy,
      // rate: host.rate,
      coin: host.coin,
      token: host.token,
      channel: host.channel,
      view: 0,
    }));

    shuffleArray(data);

    return res.status(200).json({ status: true, message: "Success", data });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//analytic of earning report of gift and call [for admin]
exports.callGiftAnalytic = async (req, res) => {
  try {
    const history = await History.aggregate([
      {
        $match: {
          host_id: mongoose.Types.ObjectId(req.params.host_id),
          plan_id: { $eq: null },
        },
      },
      {
        $addFields: {
          dateString: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
        },
      },
      {
        $match: {
          $and: [
            {
              dateString: {
                $gte: req.query.start,
                $lte: req.query.end,
              },
            },
          ],
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    await History.populate(history, { path: "user_id" });

    let historyData = [];
    let totalGiftCoin = 0;
    await history.map((data) => {
      totalGiftCoin += data.coin;
      historyData.push({
        type: data.user_id ? "Gift" : "Bonus",
        name: data.user_id ? data.user_id.name : "By Admin",
        time: 0,
        image: data.user_id ? data.user_id.image : "",
        coin: data.coin,
        date: data.createdAt,
      });
    });

    const callHistory = await CallHistory.aggregate([
      {
        $match: {
          host_id: mongoose.Types.ObjectId(req.params.host_id),
          time: { $ne: 0 },
          coin: { $ne: 0 },
        },
      },
      {
        $addFields: {
          dateString: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
        },
      },
      {
        $match: {
          $and: [
            {
              dateString: {
                $gte: req.query.start,
                $lte: req.query.end,
              },
            },
          ],
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    await CallHistory.populate(callHistory, { path: "user_id" });

    const calHistoryData = [];
    let totalCallCoin = 0;
    await callHistory.map((data) => {
      totalCallCoin += data.coin;
      calHistoryData.push({
        type: "Call",
        name: data.user_id ? data.user_id.name : "",
        image: data.user_id ? data.user_id.image : "",
        time: data.time,
        coin: data.coin,
        gift: data.gift.length,
        date: data.createdAt,
      });
    });

    const analytic = calHistoryData.concat(historyData);

    return res.status(200).json({
      status: true,
      message: "Success!!",
      data: analytic,
      totalCoin: { totalCallCoin, totalGiftCoin },
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//analytic of earning report of live streaming [for admin]
exports.liveStreamingAnalytic = async (req, res) => {
  try {
    const liveStreamingHistory = await LiveStreamingHistory.aggregate([
      {
        $match: {
          host_id: mongoose.Types.ObjectId(req.params.host_id),
          time: { $ne: 0 },
          coin: { $ne: 0 },
        },
      },
      {
        $addFields: {
          dateString: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
        },
      },
      {
        $match: {
          $and: [
            {
              dateString: {
                $gte: req.query.start,
                $lte: req.query.end,
              },
            },
          ],
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    let historyData = [];
    let totalCoin = 0;
    await liveStreamingHistory.map((data) => {
      totalCoin += data.coin;
      historyData.push({
        time: data.time,
        user: data.user,
        gift: data.gift,
        coin: data.coin,
        date: data.createdAt,
      });
    });

    return res.status(200).json({
      status: true,
      message: "Success!!",
      data: historyData,
      totalCoin,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//get level of host
exports.getLevel = async (req, res) => {
  try {
    const host = await Host.findById(req.query.host_id);
    if (!host)
      return res
        .status(200)
        .json({ status: false, message: "Host does not Exist!!" });
    const level = await Level.find({ type: { $in: ["host"] } }).sort({
      rupee: 1,
    });

    let temp = level.length > 0 && level[0].name;
    await level.map(async (data) => {
      if (data.rupee <= host.receivedCoin) {
        return (temp = data.name);
      }
    });

    return res.status(200).json({ status: true, level: temp, levels: level });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//add extra bonus in host by admin
exports.bonusSwitch = async (req, res) => {
  try {
    const host = await Host.findById(req.params.host_id);

    if (!host)
      return res
        .status(200)
        .json({ status: false, message: "Host does not Exist!!" });
    const setting = await Setting.find();

    if (host.bonusSwitch) {
      host.bonusSwitch = false;
    } else {
      host.coin += setting[0].bonus;

      const history = new History();

      history.user_id = null;
      history.host_id = req.params.host_id;
      history.coin = setting[0].bonus;

      await history.save();

      host.bonusSwitch = true;

      if (host.isLogout === false && host.block === false) {
        const payload = {
          to: host.fcm_token,
          notification: {
            title: `Hello, ${host.name}`,
            body: `You got ${setting[0].bonus} coin Reward from Admin!!`,
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
    }
    await host.save();

    return res
      .status(200)
      .json({ status: true, message: "Success!!", data: host });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//get analytic of streaming, gift and video call for android
exports.hostAnalytic = async (req, res, next) => {
  try {
    const host = await History.find({ host_id: req.query.host_id });

    if (!host)
      return res
        .status(200)
        .json({ status: false.valueOf, message: "Host does not Exist!!" });

    //gift filter
    const giftFilter = {
      host_id: mongoose.Types.ObjectId(req.query.host_id),
      coin: { $ne: 0 },
      plan_id: null,
    };

    //gift history date wise all gift
    let giftHistory = await History.aggregate([
      { $match: giftFilter },
      {
        $addFields: {
          dateString: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
        },
      },
      {
        $match: {
          $and: [
            {
              dateString: {
                $gte: req.query.start,
                $lte:
                  req.query.end === "null" ? req.query.start : req.query.end,
              },
            },
          ],
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    //date wise total gift coin
    let totalGiftCoin = 0;
    await giftHistory.map((data) => {
      totalGiftCoin += data.coin;
    });

    //call history filter
    const callFilter = {
      host_id: mongoose.Types.ObjectId(req.query.host_id),
      coin: { $ne: 0 },
      time: { $ne: 0 },
    };

    //call history date wise
    let callHistory = await CallHistory.aggregate([
      { $match: callFilter },
      {
        $addFields: {
          dateString: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
        },
      },
      {
        $match: {
          $and: [
            {
              dateString: {
                $gte: req.query.start,
                $lte:
                  req.query.end === "null" ? req.query.start : req.query.end,
              },
            },
          ],
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    let totalCallCoin = 0;
    let totalDuration = 0;
    await callHistory.map((data) => {
      totalCallCoin += data.coin;
      totalDuration += data.time;
    });

    // convert duration second to hh:mm:ss
    var d = Number(totalDuration);

    var h = Math.floor(d / 3600)
      .toString()
      .padStart(2, "0");
    var m = Math.floor((d % 3600) / 60)
      .toString()
      .padStart(2, "0");
    var s = Math.floor(d % 60)
      .toString()
      .padStart(2, "0");

    //live streaming history filter
    const liveStreamingFilter = {
      host_id: mongoose.Types.ObjectId(req.query.host_id),
    };

    //live streaming history date wise
    let liveStreamingHistory = await LiveStreamingHistory.aggregate([
      { $match: liveStreamingFilter },
      {
        $addFields: {
          dateString: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
        },
      },
      {
        $match: {
          $and: [
            {
              dateString: {
                $gte: req.query.start,
                $lte:
                  req.query.end === "null" ? req.query.start : req.query.end,
              },
            },
          ],
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    let totalLiveStreamingCoin = 0;
    let totalLiveStreamingDuration = 0;
    await liveStreamingHistory.map((data) => {
      totalLiveStreamingCoin += data.coin;
      totalLiveStreamingDuration += data.time;
    });

    // convert duration second to hh:mm:ss
    var d = Number(totalLiveStreamingDuration);

    var hour = Math.floor(d / 3600)
      .toString()
      .padStart(2, "0");
    var minute = Math.floor((d % 3600) / 60)
      .toString()
      .padStart(2, "0");
    var second = Math.floor(d % 60)
      .toString()
      .padStart(2, "0");

    return res.status(200).json({
      status: true,
      message: "Success!!",
      totalGift: giftHistory.length,
      totalGiftCoin,
      totalCallCoin,
      totalCallDuration: h + ":" + m + ":" + s,
      totalLiveStreamingCoin,
      totalLiveStreamingDuration: hour + ":" + minute + ":" + second,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.logout = async (req, res) => {
  try {
    const host = await Host.findById(req.query.host_id);

    if (!host) {
      return res.status(200).json({ status: false, message: "host not found" });
    }

    host.isLogout = true;

    await host.save();

    return res.status(200).json({ status: true, message: "success" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message || "server error" });
  }
};

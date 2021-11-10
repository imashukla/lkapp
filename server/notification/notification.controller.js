const Notification = require("./notification.model");
const User = require("../user/user.model");
const Host = require("../host/host.model");
const dayjs = require("dayjs");
const { serverPath } = require("../../util/serverPath");
// const { admin } = require("../../firebaseConfig");

//FCM
var FCM = require("fcm-node");
var { serverKey } = require("../../util/serverPath");
var fcm = new FCM(serverKey);

//for android user
exports.getUserNotification = async (req, res) => {
  try {
    const start = req.query.start ? parseInt(req.query.start) : 0;
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;

    const user = await User.findById(req.query.user_id);
    if (!user)
      return res
        .status(200)
        .json({ status: false, message: "User does not Exist!!" });
    const notification = await Notification.find({
      user_id: req.query.user_id,
    })
      .skip(start)
      .limit(limit)
      .sort({ createdAt: -1 });

    if (!notification) {
      return res.status(200).json({ status: false, message: "not found" });
    }
    let now = dayjs();

    const notification_ = notification.map((data) => ({
      _id: data._id,
      title: data.title,
      description: data.description,
      type: data.type,
      image: data.image,
      user_id: data.user_id,
      time:
        now.diff(data.createdAt, "minute") <= 60 &&
        now.diff(data.createdAt, "minute") >= 0
          ? now.diff(data.createdAt, "minute") + " minutes ago"
          : now.diff(data.createdAt, "hour") >= 24
          ? now.diff(data.createdAt, "day") + " days ago"
          : now.diff(data.createdAt, "hour") + " hours ago",
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      __v: data.__v,
    }));
    return res
      .status(200)
      .json({ status: true, message: "success", data: notification_ });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};
//for host
exports.getHostNotification = async (req, res) => {
  try {
    const start = req.query.start ? parseInt(req.query.start) : 0;
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;

    const host = await Host.findById(req.query.host_id);
    if (!host)
      return res
        .status(200)
        .json({ status: false, message: "Host does not Exist!!" });

    const notification = await Notification.find({
      host_id: req.query.host_id,
    })
      .skip(start)
      .limit(limit)
      .sort({ createdAt: -1 });

    if (!notification) {
      return res.status(200).json({ status: false, message: "not found" });
    }
    let now = dayjs();

    const notification_ = notification.map((data) => ({
      _id: data._id,
      title: data.title,
      description: data.description,
      type: data.type,
      image: data.image,
      host_id: data.host_id,
      time:
        now.diff(data.createdAt, "minute") <= 60 &&
        now.diff(data.createdAt, "minute") >= 0
          ? now.diff(data.createdAt, "minute") + " minutes ago"
          : now.diff(data.createdAt, "hour") >= 24
          ? now.diff(data.createdAt, "day") + " days ago"
          : now.diff(data.createdAt, "hour") + " hours ago",
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      __v: data.__v,
    }));
    return res
      .status(200)
      .json({ status: true, message: "success", data: notification_ });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//send notification through FCM
exports.sendNotification = async (req, res) => {
  try {
    if (req.body.type.trim().toLowerCase() === "all") {
      const topic = "/topics/HILIVE";
      var message = {
        to: topic,

        notification: {
          body: req.body.description,
          title: req.body.title,
          image: serverPath + req.file.path,
        },
      };

      await fcm.send(message, function (err, response) {
        if (err) {
          console.log("Something has gone wrong!");
        } else {
          res.status(200).json({
            status: 200,
            message: "Successfully sent message",
            data: true,
          });
          console.log("Successfully sent with response: ", response);
        }
      });
    } else if (req.body.type.trim().toLowerCase() === "join") {
      //today join user
      const user = await User.aggregate([
        {
          $addFields: {
            dateString: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
          },
        },
        {
          $match: {
            dateString: {
              $eq: new Date().toISOString().slice(0, 10),
            },
          },
        },
      ]);

      await user.map(async (data) => {
        if (data.isLogout === false && data.block === false) {
          const payload = {
            to: data.fcm_token,
            notification: {
              body: req.body.description,
              title: req.body.title,
              image: serverPath + req.file.path,
            },
          };

          await fcm.send(payload, function (err, response) {
            if (err) {
              console.log("Something has gone wrong!");
            } else {
              console.log("Successfully sent with response: ", response);
              res.status(200).json({
                status: 200,
                message: "Successfully sent message",
                data: true,
              });
            }
          });
        }
      });
    } else if (req.body.type.trim().toLowerCase() === "paid") {
      const user = await User.find({
        isVIP: true,
        plan_start_date: { $ne: null },
        block: false,
        isLogout: false,
      });

      await user.map(async (data) => {
        const payload = {
          to: data.fcm_token,
          notification: {
            body: req.body.description,
            title: req.body.title,
            image: serverPath + req.file.path,
          },
        };

        await fcm.send(payload, function (err, response) {
          if (err) {
            console.log("Something has gone wrong!");
          } else {
            console.log("Successfully sent with response: ", response);
            res.status(200).json({
              status: 200,
              message: "Successfully sent message",
              data: true,
            });
          }
        });
      });
    } else if (req.body.type.trim().toLowerCase() === "online") {
      const topic = "/topics/ONLINE";
      var message = {
        to: topic,

        notification: {
          body: req.body.description,
          title: req.body.title,
          image: serverPath + req.file.path,
        },
      };

      await fcm.send(message, function (err, response) {
        if (err) {
          console.log("Something has gone wrong!");
        } else {
          res.status(200).json({
            status: 200,
            message: "Successfully sent message",
            data: true,
          });
          console.log("Successfully sent with response: ", response);
        }
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

exports.profileVisitNotification = async (req, res) => {
  try {
    if (req.body.user_id && req.body.host_id) {
      const user = await User.findById(req.body.user_id);
      if (!user)
        return res
          .status(200)
          .json({ status: false, message: "User does not Exist!!" });

      const host = await Host.findById(req.body.host_id);
      if (!host)
        return res
          .status(200)
          .json({ status: false, message: "Host does not Exist!!" });

      const notification = new Notification();

      notification.title = "You got New Visitor";
      notification.description = `${user.name} Visited your Profile.`;
      notification.type = "follow";
      notification.image = user.image;
      notification.host_id = req.body.host_id;

      await notification.save();

      const payload = {
        to: host.fcm_token,
        notification: {
          body: `${user.name} Visited your Profile.`,
        },
      };

      await fcm.send(payload, function (err, response) {
        if (err) {
          console.log("Something has gone wrong!");
        } else {
          console.log("Successfully sent with response: ", response);
        }
      });
      return res.status(200).json({ status: true, message: "Success!!" });
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
//call missCall notification
exports.missCallNotification = async (req, res) => {
  try {
    if (req.body.user_id && req.body.host_id) {
      const user = await User.findById(req.body.user_id);
      if (!user)
        return res
          .status(200)
          .json({ status: false, message: "User does not Exist!!" });

      const host = await Host.findById(req.body.host_id);
      if (!host)
        return res
          .status(200)
          .json({ status: false, message: "Host does not Exist!!" });

      const payload = {
        to: host.fcm_token,
        notification: {
          title: "Missed call",
          body: `${user.name}`,
        },
      };

      await fcm.send(payload, function (err, response) {
        if (err) {
          console.log("Something has gone wrong!");
        } else {
          console.log("Successfully sent with response: ", response);
        }
      });
      return res.status(200).json({ status: true, message: "Success!!" });
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

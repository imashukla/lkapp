//host follower model
const Follower = require("./hostFollower.model");
const User = require("../user/user.model");
const Host = require("../host/host.model");
const UserFollower = require("../userFollower/userFollower.model");
const Notification = require("../notification/notification.model");

//FCM
var FCM = require("fcm-node");
var { serverKey } = require("../../util/serverPath");
var fcm = new FCM(serverKey);

exports.follow = async (req, res) => {
  try {
    if (!req.body)
      return res
        .status(200)
        .json({ status: false, message: "Invalid details" });
    if (!req.body.user_id)
      return res
        .status(200)
        .json({ status: false, message: "User id is Required!" });
    if (!req.body.host_id)
      return res
        .status(200)
        .json({ status: false, message: "Host id is Required!" });

    const user = await User.findById(req.body.user_id);

    if (!user) {
      return res
        .status(200)
        .json({ status: false, message: "User does not Exist!!" });
    }

    const host = await Host.findById(req.body.host_id);

    if (!host) {
      return res
        .status(200)
        .json({ status: false, message: "Host does not Exist!!" });
    }

    const followHost = await Follower.findOne({
      $and: [
        {
          user_id: req.body.user_id,
          host_id: req.body.host_id,
        },
      ],
    });

    if (followHost) {
      return res
        .status(200)
        .send({ status: true, message: "Follow successful" });
    }

    const followerData = {
      user_id: req.body.user_id,
      host_id: req.body.host_id,
    };

    const addFollower = new Follower(followerData);

    const notification = new Notification();

    notification.title = "New Follower";
    notification.description = `${host.name} Started Following You.`;
    notification.type = "follow";
    notification.image = host.image;
    notification.user_id = req.body.user_id;

    await notification.save();

    addFollower.save(async (err, result) => {
      if (err)
        return res
          .status(500)
          .json({ status: false, message: "Internal server error" });
      else {
        await Host.update(
          { _id: req.body.host_id },
          { $inc: { following_count: 1 } }
        );
        await User.update(
          { _id: req.body.user_id },
          { $inc: { followers_count: 1 } }
        );

        if (user.isLogout === false && user.block === false) {
          const payload = {
            to: user.fcm_token,
            notification: {
              title: "New Follower",
              body: `${user.name} Started Following You.`,
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

        return res
          .status(200)
          .send({ status: true, message: "Follow successful" });
      }
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

exports.unFollow = async (req, res) => {
  try {
    if (!req.body)
      return res
        .status(200)
        .json({ status: false, message: "Invalid details" });
    if (!req.body.user_id)
      return res
        .status(200)
        .json({ status: false, message: "User id is Required!" });
    if (!req.body.host_id)
      return res
        .status(200)
        .json({ status: false, message: "Host id is Required!" });

    Follower.deleteOne({
      user_id: req.body.user_id,
      host_id: req.body.host_id,
    }).exec(async (err, result) => {
      if (err)
        return res
          .status(500)
          .json({ status: false, message: "Internal server error" });
      else {
        await User.update(
          { _id: req.body.user_id },
          { $inc: { following_count: -1 } }
        );
        await Host.update(
          { _id: req.body.host_id },
          { $inc: { followers_count: -1 } }
        );

        return res
          .status(200)
          .send({ status: true, message: "UnFollow successful" });
      }
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

exports.followerList = async (req, res) => {
  try {
    const start = req.body.start ? parseInt(req.body.start) : 0;
    const limit = req.body.limit ? parseInt(req.body.limit) : 5;
    if (req.body.host_id) {
      UserFollower.find({ host_id: req.body.host_id }, { user_id: 1 })
        .populate("user_id")
        .skip(start)
        .limit(limit)
        .exec((err, followers) => {
          if (err)
            return res
              .status(500)
              .send({ status: false, message: "Internal server error" });
          else {
            return res.status(200).send({
              status: true,
              message: "Followers list successful",
              followers,
            });
          }
        });
    } else {
      return res
        .status(200)
        .send({ status: false, message: "Invalid details" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

exports.followingList = async (req, res) => {
  try {
    const start = req.body.start ? parseInt(req.body.start) : 0;
    const limit = req.body.limit ? parseInt(req.body.limit) : 5;
    if (req.body.host_id) {
      Follower.find({ host_id: req.body.host_id }, { host_id: 1 })
        .populate("user_id")
        .skip(start)
        .limit(limit)
        .exec((err, followers) => {
          if (err)
            return res
              .status(500)
              .send({ status: false, message: "Internal server error" });
          else {
            return res.status(200).send({
              status: true,
              message: "Following list successful",
              followers,
            });
          }
        });
    } else {
      return res
        .status(200)
        .send({ status: false, message: "Invalid details" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

exports.checkIsFollow = async (req, res) => {
  try {
    if (!req.body)
      return res
        .status(200)
        .json({ status: false, message: "Invalid details" });
    if (!req.body.host_id)
      return res
        .status(200)
        .json({ status: false, message: "Host id is Required!" });
    if (!req.body.guest_id)
      return res
        .status(200)
        .json({ status: false, message: "Guest User id is Required!" });

    const hostExist = await Host.findById(req.body.host_id);

    if (!hostExist) {
      return res
        .status(200)
        .json({ status: false, message: "Host does not Exist!!" });
    }

    const guestUserExist = await User.findById(req.body.guest_id);

    if (!guestUserExist) {
      return res
        .status(200)
        .json({ status: false, message: "Guest User does not Exist!!" });
    }

    const follower = await Follower.findOne({
      host_id: req.body.host_id,
    }).where({ user_id: req.body.guest_id });

    if (follower) {
      return res.status(200).json({ status: true, message: "follow" });
    } else {
      return res.status(200).json({ status: false, message: "not follow" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

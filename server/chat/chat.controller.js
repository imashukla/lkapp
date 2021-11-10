const Chat = require("./chat.model");
const User = require("../user/user.model");
const Host = require("../host/host.model");

//FCM
var FCM = require("fcm-node");
var { serverKey } = require("../../util/serverPath");
var fcm = new FCM(serverKey);

exports.getUserOldChat = async (req, res) => {
  try {
    if (!req.body)
      return res
        .status(200)
        .json({ status: false, message: "Invalid details." });
    if (!req.body.user_id)
      return res
        .status(200)
        .json({ status: false, message: "User id is Required!" });
    if (!req.body.topic)
      return res
        .status(200)
        .json({ status: false, message: "Topic is Required!" });

    const start = req.body.start ? parseInt(req.body.start) : 0;
    const limit = req.body.limit ? parseInt(req.body.limit) : 5;

    const chat = await Chat.find({
      user_id: req.body.user_id,
      topic: req.body.topic,
    })
      .skip(start)
      .limit(limit);

    return res
      .status(200)
      .json({ status: true, message: "success", data: chat });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};
exports.getHostOldChat = async (req, res) => {
  try {
    if (!req.body)
      return res
        .status(200)
        .json({ status: false, message: "Invalid details." });
    if (!req.body.host_id)
      return res
        .status(200)
        .json({ status: false, message: "Host id is Required!" });
    if (!req.body.topic)
      return res
        .status(200)
        .json({ status: false, message: "Topic is Required!" });

    const start = req.body.start ? parseInt(req.body.start) : 0;
    const limit = req.body.limit ? parseInt(req.body.limit) : 5;

    const chat = await Chat.find({
      host_id: req.body.host_id,
      topic: req.body.topic,
    })
      .skip(start)
      .limit(limit);

    return res
      .status(200)
      .json({ status: true, message: "success", data: chat });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

exports.store = async (req, res) => {
  try {
    if (!req.body)
      return res
        .status(200)
        .json({ status: false, message: "Invalid details." });
    if (!req.body.host_id)
      return res
        .status(200)
        .json({ status: false, message: "Host id is Required!" });
    if (!req.body.user_id)
      return res
        .status(200)
        .json({ status: false, message: "User id is Required!" });
    if (!req.body.message)
      return res
        .status(200)
        .json({ status: false, message: "Message is Required!" });
    if (!req.body.topic)
      return res
        .status(200)
        .json({ status: false, message: "Topic is Required!" });
    if (!req.body.sender)
      return res
        .status(200)
        .json({ status: false, message: "Sender type is Required!" });

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

    const chat = await Chat.create({
      user_id: req.body.user_id,
      host_id: req.body.host_id,
      message: req.body.message,
      topic: req.body.topic,
      sender: req.body.sender,
    });

    if (!chat) {
      throw new Error();
    }

    const chatData = await Chat.findById(chat._id).populate("user_id host_id");
    if (req.body.sender === "user") {
      const payload = {
        to: chatData.host_id.fcm_token,
        notification: {
          body: req.body.message,
          title: chatData.user_id.name,
        },
        data: {
          userId: chatData.user_id._id.toString(),
          name: chatData.user_id.name,
          image: chatData.user_id.image,
          notificationType: "chat",
        },
      };
      if (
        chatData.host_id.isLogout === false &&
        chatData.host_id.block === false
      ) {
        await fcm.send(payload, function (err, response) {
          if (err) {
            console.log("Something has gone wrong!");
          } else {
            console.log("Successfully sent with response: ", response);
          }
        });
      }
    } else {
      const payload = {
        to: chatData.user_id.fcm_token,
        notification: {
          body: req.body.message,
          title: chatData.host_id.name,
        },
        data: {
          hostId: chatData.host_id._id.toString(),
          name: chatData.host_id.name,
          image: chatData.host_id.image,
          notificationType: "chat",
        },
      };
      if (
        chatData.user_id.isLogout === false &&
        chatData.user_id.block === false
      ) {
        await fcm.send(payload, function (err, response) {
          if (err) {
            console.log("Something has gone wrong!");
          } else {
            console.log("Successfully sent with response: ", response);
          }
        });
      }
    }

    return res
      .status(200)
      .json({ status: true, message: "success", data: chat });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

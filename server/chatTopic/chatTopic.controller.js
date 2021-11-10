const ChatTopic = require("./chatTopic.model");
const Chat = require("../chat/chat.model");
const User = require("../user/user.model");
const Host = require("../host/host.model");
const arraySort = require("array-sort");

const dayjs = require("dayjs");

//get chat thumb list for user
exports.chatUserList = async (req, res) => {
  try {
    let now = dayjs();
    const user = await User.findById(req.query.user_id);

    const start = req.query.start ? parseInt(req.query.start) : 0;
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;

    if (!user) {
      return res
        .status(200)
        .json({ status: false, message: "User Does not Exist!!" });
    }

    //get list of host whom user was chat
    const hostList = await ChatTopic.find({ user_id: req.query.user_id })
      .skip(start)
      .limit(limit);

    let chatThumbList = [];

    for (let i = 0; i < hostList.length; i++) {
      let host = await Host.findById(hostList[i].host_id);
      if (host) {
        let chat = await Chat.findOne({
          topic: hostList[i]._id,
        }).sort({ createdAt: -1 });

        if (chat) {
          let time = "";
          time =
            now.diff(chat.createdAt, "minute") <= 60 &&
            now.diff(chat.createdAt, "minute") >= 0
              ? now.diff(chat.createdAt, "minute") + " minutes ago"
              : now.diff(chat.createdAt, "hour") >= 24
              ? now.diff(chat.createdAt, "day") + " days ago"
              : now.diff(chat.createdAt, "hour") + " hours ago";

          chatThumbList.push({
            _id: host ? host._id : "",
            name: host ? host.name : "",
            image: host ? host.image : "",
            country_name: host ? host.country : "",
            message: chat ? chat.message : "",
            sender: chat ? chat.sender : "",
            topic: chat ? chat.topic : "",
            time: time === "0 minutes ago" ? "now" : time,
            createdAt: chat.createdAt,
          });
        }
      }
    }

    arraySort(chatThumbList, "createdAt", { reverse: true });

    return res
      .status(200)
      .json({ status: true, message: "success", data: chatThumbList });
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      status: error.status,
      message: error.errors || error.message || "server error",
    });
  }
};
//get chat thumb list for host
exports.chatHostList = async (req, res) => {
  try {
    let now = dayjs();
    const host = await Host.findById(req.query.host_id);

    const start = req.query.start ? parseInt(req.query.start) : 0;
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;

    if (!host) {
      return res
        .status(200)
        .json({ status: false, message: "Host Does not Exist!!" });
    }

    //get list of user whom host was chat
    const userList = await ChatTopic.find({ host_id: req.query.host_id })
      .skip(start)
      .limit(limit);

    let chatThumbList = [];

    for (let i = 0; i < userList.length; i++) {
      let user = await User.findById(userList[i].user_id);
      if (user) {
        let chat = await Chat.findOne({
          topic: userList[i]._id,
        }).sort({ createdAt: -1 });

        if (chat) {
          let time = "";
          time =
            now.diff(chat.createdAt, "minute") <= 60 &&
            now.diff(chat.createdAt, "minute") >= 0
              ? now.diff(chat.createdAt, "minute") + " minutes ago"
              : now.diff(chat.createdAt, "hour") >= 24
              ? now.diff(chat.createdAt, "day") + " days ago"
              : now.diff(chat.createdAt, "hour") + " hours ago";

          chatThumbList.push({
            _id: user ? user._id : "",
            name: user ? user.name : "",
            image: user ? user.image : "",
            country_name: user ? user.country : "",
            message: chat ? chat.message : "",
            sender: chat ? chat.sender : "",
            topic: chat ? chat.topic : "",
            time: time === "0 minutes ago" ? "now" : time,
            createdAt: chat.createdAt,
          });
        }
      }
    }

    arraySort(chatThumbList, "createdAt", { reverse: true });

    return res
      .status(200)
      .json({ status: true, message: "success", data: chatThumbList });
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      status: error.status,
      message: error.errors || error.message || "server error",
    });
  }
};

exports.store = async (req, res) => {
  try {
    if (!req.body)
      return res
        .status(200)
        .json({ status: false, message: "Invalid Details." });
    if (!req.body.user_id)
      return res
        .status(200)
        .json({ status: false, message: "User id is Required!!" });
    if (!req.body.host_id)
      return res
        .status(200)
        .json({ status: false, message: "Host id is Required!!" });

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

    const isTopicExist = await ChatTopic.findOne({
      $and: [
        { user_id: req.body.user_id },
        {
          host_id: req.body.host_id,
        },
      ],
    });

    if (isTopicExist) {
      return res
        .status(200)
        .json({ status: true, message: "success", data: isTopicExist });
    }

    const chatTopic = await ChatTopic.create({
      user_id: req.body.user_id,
      host_id: req.body.host_id,
    });

    if (!chatTopic) {
      throw new Error();
    }

    return res
      .status(200)
      .json({ status: true, message: "success", data: chatTopic });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

exports.userSearch = async (req, res) => {
  try {
    var response = [];
    let now = dayjs();
    const start = req.body.start ? parseInt(req.body.start) : 0;
    const limit = req.body.limit ? parseInt(req.body.limit) : 5;

    const user = await User.findById(req.body.user_id);

    if (!user)
      return res
        .status(200)
        .json({ status: false, message: "User does not Exist!!" });

    if (req.body.name) {
      req.body.name === "@#"
        ? (response = await Host.find().skip(start).limit(limit))
        : (response = await Host.find({
            name: { $regex: req.body.name, $options: "i" },
          })
            .skip(start)
            .limit(limit));

      let data = [];
      for (let i = 0; i < response.length; i++) {
        let chatTopic = await ChatTopic.findOne({
          host_id: response[i]._id,
          user_id: req.body.user_id,
        });

        if (chatTopic) {
          let chat = await Chat.findOne({
            topic: chatTopic._id,
          }).sort({ createdAt: -1 });

          let time = "";

          if (chat) {
            time =
              now.diff(chat.createdAt, "minute") <= 60 &&
              now.diff(chat.createdAt, "minute") >= 0
                ? now.diff(chat.createdAt, "minute") + " minutes ago"
                : now.diff(chat.createdAt, "hour") >= 24
                ? now.diff(chat.createdAt, "day") + " days ago"
                : now.diff(chat.createdAt, "hour") + " hours ago";
          }

          data.push({
            _id: response[i]._id,
            name: response[i].name,
            image: response[i].image,
            country_name: response[i].country,
            message: chat ? chat.message : response[i].bio,
            topic: chat ? chat.topic : "",
            time: time === "0 minutes ago" ? "now" : time,
            createdAt: chat ? chat.createdAt : "",
          });
        } else {
          data.push({
            _id: response[i]._id,
            name: response[i].name,
            image: response[i].image ? response[i].image : "",
            country_name: response[i].country,
            message: response[i].bio,
            topic: "",
            time: "New User",
            createdAt: "",
          });
        }
      }

      const test = arraySort(data, "createdAt", { reverse: true });

      return res
        .status(200)
        .json({ status: true, message: "success", data: test });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message || "server error" });
  }
};
exports.hostSearch = async (req, res) => {
  try {
    var response = [];
    let now = dayjs();
    const start = req.body.start ? parseInt(req.body.start) : 0;
    const limit = req.body.limit ? parseInt(req.body.limit) : 5;

    const hostFollower = await Host.findById(req.body.host_id);

    if (!hostFollower)
      return res
        .status(200)
        .json({ status: false, message: "Host does not Exist!!" });
    if (req.body.name) {
      req.body.name === "@#"
        ? (response = await User.find().skip(start).limit(limit))
        : (response = await User.find({
            name: { $regex: req.body.name, $options: "i" },
          })
            .skip(start)
            .limit(limit));

      let data = [];
      for (let i = 0; i < response.length; i++) {
        let chatTopic = await ChatTopic.findOne({
          user_id: response[i]._id,
          host_id: req.body.host_id,
        });

        if (chatTopic) {
          let chat = await Chat.findOne({
            topic: chatTopic._id,
          }).sort({ createdAt: -1 });

          let time = "";

          if (chat) {
            time =
              now.diff(chat.createdAt, "minute") <= 60 &&
              now.diff(chat.createdAt, "minute") >= 0
                ? now.diff(chat.createdAt, "minute") + " minutes ago"
                : now.diff(chat.createdAt, "hour") >= 24
                ? now.diff(chat.createdAt, "day") + " days ago"
                : now.diff(chat.createdAt, "hour") + " hours ago";
          }

          data.push({
            _id: response[i]._id,
            name: response[i].name,
            image: response[i].image,
            country_name: response[i].country,
            message: chat ? chat.message : "",
            topic: chat ? chat.topic : response[i].bio,
            time: time === "0 minutes ago" ? "now" : time,
            createdAt: chat ? chat.createdAt : "",
          });
        } else {
          data.push({
            _id: response[i]._id,
            name: response[i].name,
            image: response[i].image ? response[i].image : "",
            country_name: response[i].country,
            message: response[i].bio,
            topic: "",
            time: "New User",
            createdAt: "",
          });
        }
      }

      const test = arraySort(data, "createdAt", { reverse: true });

      return res
        .status(200)
        .json({ status: true, message: "success", data: test });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message || "server error" });
  }
};

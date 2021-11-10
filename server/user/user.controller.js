const User = require("./user.model");
const VIPPlan = require("../VIP plan/VIPplan.model");
const Setting = require("../setting/setting.model");
const Level = require("../level/level.model");

const { serverPath } = require("../../util/serverPath");
const fs = require("fs");
const dayjs = require("dayjs");

exports.index = async (req, res) => {
  try {
    const user = await User.find().sort({ createdAt: -1 });
    if (!user) {
      throw new Error();
    }

    return res
      .status(200)
      .json({ status: true, message: "success", data: user });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

exports.checkUsername = async (req, res) => {
  try {
    if (!req.body.username)
      return res
        .status(200)
        .json({ status: false, message: "Oops! username is required." });
    if (!req.body.user_id)
      return res
        .status(200)
        .json({ status: false, message: "Oops! user id is required." });

    User.findOne({ username: req.body.username }).exec((error, user) => {
      if (error)
        return res
          .status(500)
          .json({ status: false, message: "Internal server error" });
      else {
        if (user && user._id.toString() !== req.body.user_id) {
          return res
            .status(200)
            .json({ status: false, message: "Username already taken!" });
        } else
          return res.status(200).json({
            status: true,
            message: "Username generated successfully!",
          });
      }
    });
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
    if (!req.body.name)
      return res
        .status(200)
        .json({ status: false, message: "Name is required." });
    if (!req.body.image)
      return res
        .status(200)
        .json({ status: false, message: "Image is required." });
    if (!req.body.username)
      return res
        .status(200)
        .json({ status: false, message: "Username is required." });
    if (!req.body.fcmtoken)
      return res
        .status(200)
        .json({ status: false, message: "fcm token is required." });
    if (!req.body.identity)
      return res
        .status(200)
        .json({ status: false, message: "Identity is required." });
    if (!req.body.type)
      return res
        .status(200)
        .json({ status: false, message: "Type is required." });

    const user = await User.findOne({ identity: req.body.identity });

    if (user && user._id) {
      user.isLogout = false;
      user.fcm_token = req.body.fcmtoken;
      user.name = req.body.name;
      user.gender = req.body.gender;
      user.image = req.body.image;
      user.lastLoginDate = new Date();
      user.IPAddress = req.body.IPAddress;
      user.country = !req.body.country ? "India" : req.body.country;
      await user.save();
      return res.status(200).json({ status: true, message: "success", user });
    } else {
      const setting = await Setting.find().sort({ createdAt: -1 });

      const user = new User();

      user.type = req.body.type;
      user.mobileNo = req.body.mobileNo;
      user.name = req.body.name;
      user.IPAddress = req.body.IPAddress;
      user.image = req.body.image;
      user.username = req.body.username;
      user.identity = req.body.identity;
      user.fcm_token = req.body.fcmtoken;
      user.country = !req.body.country ? "India" : req.body.country;
      user.coin = setting[0].loginBonus;
      user.lastLoginDate = new Date();
      user.uniqueId =
        Math.floor(Math.random() * (99999999 - 11111111)) + 11111111;
      await user.save();

      return res.status(200).json({ status: true, message: "success", user });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.query.user_id);

    if (!user) {
      return res.status(200).json({ status: false, message: "User not found" });
    }

    if (user.plan_id) {
      const user_ = await checkPlan(user._id, user.plan_id);
      return res
        .status(200)
        .json({ status: true, message: "success", user: user_ });
    } else {
      return res.status(200).json({ status: true, message: "success", user });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//for android
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.body.user_id);

    if (!user) {
      return res.status(200).json({ status: false, message: "user not found" });
    }

    if (req.file) {
      if (fs.existsSync(user.image)) {
        fs.unlinkSync(user.image);
      }
      user.image = serverPath + req.file.path;
    }

    if (req.body.name) {
      user.name = req.body.name;
    }
    if (req.body.username) {
      user.username = req.body.username;
    }
    if (req.body.bio) {
      user.bio = req.body.bio;
    }
    // if (req.body.rate) {
    //   user.rate = req.body.rate;
    // }

    await user.save();

    return res.status(200).json({ status: true, message: "success", user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message || "server error" });
  }
};

//for admin
exports.update = async (req, res) => {
  try {
    const user = await User.findById(req.params.user_id);

    if (!user) {
      return res
        .status(200)
        .json({ status: false, message: "User does not Exist!!" });
    }

    if (req.file) {
      if (fs.existsSync(user.image)) {
        fs.unlinkSync(user.image);
      }
      user.image = serverPath + req.file.path;
    }

    user.name = req.body.name;
    user.username = req.body.username;
    user.bio = req.body.bio;
    user.country = req.body.country;
    // user.coin = req.body.coin;
    user.gender = req.body.gender;
    user.mobileNo = req.body.mobileNo;

    await user.save();

    return res.status(200).json({ status: true, message: "success", user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message || "server error" });
  }
};

exports.logout = async (req, res) => {
  try {
    const user = await User.findById(req.query.user_id);

    if (!user) {
      return res.status(200).json({ status: false, message: "user not found" });
    }

    user.isLogout = true;

    await user.save();

    return res.status(200).json({ status: true, message: "success" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message || "server error" });
  }
};

exports.blockUnblockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.user_id);
    if (!user) {
      return res.status(200).json({ status: false, message: "user not found" });
    }

    user.block = !user.block;
    await user.save();

    return res
      .status(200)
      .json({ status: true, message: "success", data: user });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

exports.lessCoin = async (req, res) => {
  try {
    if (!req.body)
      return res
        .status(200)
        .json({ status: false, message: "Invalid details." });

    if (!req.body.user_id)
      return res
        .status(200)
        .json({ status: false, message: "user id is required!" });
    if (!req.body.coin)
      return res
        .status(200)
        .json({ status: false, message: "coin is required!" });

    const user = await User.findById(req.body.user_id);
    if (!user) {
      return res.status(200).json({ status: false, message: "user not found" });
    }

    if (user.coin <= 0 || user.coin < req.body.coin) {
      return res
        .status(200)
        .json({ status: false, message: "You have not enough coin!" });
    }

    user.coin = user.coin - parseInt(req.body.coin);
    user.spendCoin = user.spendCoin + parseInt(req.body.coin);

    await user.save();

    return res.status(200).json({ status: true, message: "success", user });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

exports.addCoin = async (req, res) => {
  try {
    if (!req.body)
      return res
        .status(200)
        .json({ status: false, message: "Invalid details." });

    if (!req.body.user_id)
      return res
        .status(200)
        .json({ status: false, message: "user id is required!" });
    if (!req.body.coin)
      return res
        .status(200)
        .json({ status: false, message: "coin is required!" });

    const user = await User.findById(req.body.user_id);
    if (!user) {
      return res.status(200).json({ status: false, message: "user not found" });
    }

    user.coin = user.coin + parseInt(req.body.coin);

    await user.save();

    return res.status(200).json({ status: true, message: "success", user });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

exports.dailyTask = async (req, res) => {
  try {
    if (!req.body)
      return res
        .status(200)
        .json({ status: false, message: "Invalid details" });
    if (!req.body.coin)
      return res
        .status(200)
        .json({ status: false, message: "coin is required" });
    if (!req.body.user_id)
      return res
        .status(200)
        .json({ status: false, message: "user id is required" });

    const user = await User.findById(req.body.user_id);
    if (!user) {
      return res.status(200).json({ status: false, message: "User not found" });
    }
    if (user.dailyTaskFinishedCount === 10) {
      user.dailyTaskFinishedCount = 0;
      await user.save();
    }
    const date =
      new Date().getDate() +
      "-" +
      new Date().getMonth() +
      "-" +
      new Date().getFullYear();

    if (user.dailyTaskDate) {
      if (user.dailyTaskDate === date) {
        return res
          .status(200)
          .json({ status: false, message: "Please try again after 24 hours" });
      } else {
        user.coin = user.coin + parseInt(req.body.coin);
        user.dailyTaskDate =
          new Date().getDate() +
          "-" +
          new Date().getMonth() +
          "-" +
          new Date().getFullYear();
        user.dailyTaskFinishedCount = user.dailyTaskFinishedCount + 1;
        await user.save();

        if (user.dailyTaskFinishedCount === 10) {
          user.dailyTaskFinishedCount = 0;
          await user.save();
        }
      }
    } else {
      user.coin = user.coin + parseInt(req.body.coin);
      user.dailyTaskDate =
        new Date().getDate() +
        "-" +
        new Date().getMonth() +
        "-" +
        new Date().getFullYear();
      user.dailyTaskFinishedCount = user.dailyTaskFinishedCount + 1;
      await user.save();

      if (user.dailyTaskFinishedCount === 10) {
        user.dailyTaskFinishedCount = 0;
        await user.save();
      }
    }

    return res
      .status(200)
      .json({ status: true, message: "success", data: user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "server error",
    });
  }
};

exports.checkDailyTask = async (req, res) => {
  try {
    if (!req.body)
      return res
        .status(200)
        .json({ status: false, message: "Invalid details" });

    if (!req.body.user_id)
      return res
        .status(200)
        .json({ status: false, message: "user id is required" });

    const user = await User.findById(req.body.user_id);
    if (!user) {
      return res.status(200).json({ status: false, message: "User not found" });
    }

    return res.status(200).json({
      status: true,
      message: "success",
      number: user.dailyTaskFinishedCount,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "server error",
    });
  }
};

//add VIP plan
exports.addPlan = async (req, res) => {
  try {
    const user = await User.findById(req.body.user_id);
    if (!user) {
      return res
        .status(200)
        .json({ status: false, message: "User does not exist!!" });
    }

    const plan = await VIPPlan.findById(req.body.plan_id);
    if (!plan) {
      return res
        .status(200)
        .json({ status: false, message: "Plan does not exist!!" });
    }

    user.plan_id = req.body.plan_id;
    user.plan_start_date = new Date().toISOString().slice(0, 10);
    user.isVIP = true;
    await user.save();

    return res.status(200).json({ status: true, message: "success", user });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//check user plan is expired or not
const checkPlan = async (userId, planId, res) => {
  try {
    let now = dayjs();
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(200)
        .json({ status: false, message: "User does not exist!!" });
    }

    const plan = await VIPPlan.findById(planId);
    if (!plan) {
      return res
        .status(200)
        .json({ status: false, message: "Plan does not exist!!" });
    }

    const day = plan.time.includes("day");
    const month = plan.time.includes("month");
    const year = plan.time.includes("year");

    if (day) {
      const time = plan.time.split(" ")[0];
      const diffDate = now.diff(user.plan_start_date, "day");
      if (diffDate > time) {
        user.isVIP = false;
      }
    }

    if (user.plan_start_date !== null) {
      if (day) {
        const time = plan.time.split(" ")[0];
        const diffDate = now.diff(user.plan_start_date, "day");
        if (diffDate > time) {
          user.isVIP = false;
        }
      }
      if (month) {
        const time = plan.time.split(" ")[0];
        const diffDate = now.diff(user.plan_start_date, "day");
        if (diffDate > 28 * time) {
          user.isVIP = false;
        }
      }
      if (year) {
        const time = plan.time.split(" ")[0];
        const diffDate = now.diff(user.plan_start_date, "day");
        if (diffDate > 365 * time) {
          user.isVIP = false;
        }
      }
    }

    await user.save();
    return user;
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error });
  }
};

exports.getLevel = async (req, res) => {
  try {
    const user = await User.findById(req.query.user_id);
    if (!user)
      return res
        .status(200)
        .json({ status: false, message: "User does not Exist!!" });
    const level = await Level.find({ type: { $in: ["user"] } }).sort({
      rupee: 1,
    });

    let temp = level.length > 0 && level[0].name;
    await level.map(async (data) => {
      if (data.rupee <= user.spendCoin) {
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

//online
exports.isUserOnline = async (req, res) => {
  try {
    debugger;
    const user = await User.findById(req.query.user_id);

    if (!user)
      return res
        .status(200)
        .json({ status: false, message: "User does not Exist!!" });

    user.isOnline = true;

    await user.save();

    return res.status(200).json({ status: true, message: "Success!!" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};
//offline
exports.isUserOffline = async (req, res) => {
  try {
    const user = await User.findById(req.query.user_id);

    if (!user)
      return res
        .status(200)
        .json({ status: false, message: "User does not Exist!!" });

    user.isOnline = false;

    await user.save();

    return res.status(200).json({ status: true, message: "Success!!" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//update coin of user from admin panel
exports.updateCoin = async (req, res) => {
  try {
    const user = await User.findById(req.params.user_id);
    if (!user) {
      return res
        .status(200)
        .json({ status: false, message: "User does not Exist!" });
    }
    user.coin += parseInt(req.body.coin);

    await user.save((error, user) => {
      if (error)
        return res
          .status(200)
          .json({ status: false, error: error.message || "server error" });
      else
        return res.status(200).json({ status: true, message: "success", user });
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};
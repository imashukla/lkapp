const Request = require("./request.model");
const User = require("../user/user.model");
const Host = require("../host/host.model");
const Agency = require("../agency/agency.model");
const { deleteFile } = require("../../util/deleteFile");

const Cryptr = require("cryptr");
const crypt = new Cryptr("myTotalySecretKey");

//FCM
var FCM = require("fcm-node");
var { serverKey } = require("../../util/serverPath");
var fcm = new FCM(serverKey);

//get list of host
exports.index = async (req, res) => {
  try {
    const request = await Request.find({ isAccepted: false })
      .populate("user_id agencyId")
      .sort({ createdAt: -1 });

    if (!request) {
      return res
        .status(200)
        .json({ status: false, message: "Request not Found!!" });
    }

    return res
      .status(200)
      .json({ status: true, message: "Success!!", data: request });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Server Error",
    });
  }
};

//get agency wise host request list
exports.agencyWiseRequest = async (req, res) => {
  try {
    const agency = await Agency.findById(req.params.agency_id);

    if (!agency)
      return res
        .status(200)
        .json({ status: false, message: "Agency not Found!!" });
    const request = await Request.find({
      isAccepted: false,
      agencyId: req.params.agency_id,
    })
      .populate("user_id agencyId")
      .sort({ createdAt: -1 });

    if (!request) {
      return res
        .status(200)
        .json({ status: false, message: "Request not Found!!" });
    }

    return res
      .status(200)
      .json({ status: true, message: "Success!!", data: request });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Server Error",
    });
  }
};

//create host request for become host
exports.store = async (req, res) => {
  try {
    if (!req.body.bio) {
      deleteFile(req.file);
      return res
        .status(200)
        .json({ status: false, message: "Bio is required" });
    }
    if (!req.body.user_id) {
      deleteFile(req.file);
      return res
        .status(200)
        .json({ status: false, message: "User Id is required" });
    }
    if (!req.file)
      return res
        .status(200)
        .json({ status: false, message: "please select an image" });

    const user = await User.findById(req.body.user_id);
    if (!user) {
      return res.status(200).json({ status: false, message: "User not found" });
    }

    const isAgencyCodeExist = await Agency.findOne({ code: req.body.code });

    user.thumbImage = req.file.path;
    user.bio = req.body.bio;

    await user.save();

    //check user request is exist in host collection
    const isRequestExist = await Request.findOne({ user_id: req.body.user_id });
    if (isRequestExist) {
      return res.status(200).json({ status: true, message: "Success" });
    }
    const request = new Request();

    request.user_id = req.body.user_id;
    request.agencyId = isAgencyCodeExist ? isAgencyCodeExist._id : null;
    await request.save();

    if (!request) {
      return res.status(200).json({
        status: false,
        message: "request not created something went wrong!",
      });
    }

    return res.status(200).json({ status: true, message: "Success" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//accept user request for becoming host
exports.enableHost = async (req, res) => {
  try {
    if (req.body.hostId && req.body.password) {
      const request = await Request.findById(req.params.request_id);
      if (!request) {
        return res
          .status(200)
          .json({ status: false, message: "request not found" });
      }

      request.isAccepted = true;
      await request.save();

      const user = await User.findById(request.user_id);

      if (!user) {
        return res
          .status(200)
          .json({ status: false, message: "user not found" });
      }

      const isHostExist = await Host.findOne({ hostId: req.body.hostId });

      if (isHostExist)
        return res
          .status(200)
          .json({ status: false, message: "Host Id already Exist!!" });

      const host = await Host();

      host.name = user.name;
      host.image = user.image;
      host.username = user.username;
      host.hostId = req.body.hostId;
      host.password = crypt.encrypt(req.body.password);
      host.agencyId = req.body.agencyId;
      host.bio = user.bio;
      host.coin = user.coin;
      host.fcm_token = user.fcm_token;
      host.country = user.country;
      host.uniqueId = user.uniqueId;
      host.IPAddress = user.IPAddress;

      await host.save();

      if (user.isLogout === false && user.block === false) {
        const payload = {
          to: user.fcm_token,
          notification: {
            title: `Hello, ${user.name}`,
            body: "Your host request has been accepted :)",
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

      user.isHost = true;
      user.block = true;
      await user.save();

      return res
        .status(200)
        .json({ status: true, message: "success", data: host });
    } else {
      return res
        .status(500)
        .json({ status: false, message: "Invalid Detail!!" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

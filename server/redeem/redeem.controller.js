const Redeem = require("./redeem.model");
const Host = require("../host/host.model");
const Agency = require("../agency/agency.model");

//FCM
var FCM = require("fcm-node");
var { serverKey } = require("../../util/serverPath");
var fcm = new FCM(serverKey);

//get unaccepted redeem request
exports.unacceptedRequest = async (req, res) => {
  try {
    const redeem = await Redeem.find({ agency_id: req.params.agency_id })
      .where({ accepted: false })
      .sort({ createdAt: -1 })
      .populate("host_id");

    if (!redeem) {
      throw new Error();
    }

    return res
      .status(200)
      .json({ status: true, message: "success", data: redeem });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//get accepted redeem request
exports.acceptedRequest = async (req, res) => {
  try {
    const redeem = await Redeem.find({ agency_id: req.params.agency_id })
      .where({ accepted: true })
      .sort({ createdAt: -1 })
      .populate("host_id");

    if (!redeem) {
      throw new Error();
    }

    return res
      .status(200)
      .json({ status: true, message: "success", data: redeem });
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
        .json({ status: false, message: "host id is required" });
    if (!req.body.agency_id)
      return res
        .status(200)
        .json({ status: false, message: "agency id is required" });
    if (!req.body.paymentGateway)
      return res
        .status(200)
        .json({ status: false, message: "payment gateway required" });
    if (!req.body.description)
      return res
        .status(200)
        .json({ status: false, message: "description required" });
    if (!req.body.coin)
      return res
        .status(200)
        .json({ status: false, message: "coin is required" });

    const host = await Host.findById(req.body.host_id);

    if (!host) {
      return res.status(200).json({ status: false, message: "host not found" });
    }
    const agency = await Agency.findById(req.body.agency_id);

    if (!agency) {
      return res
        .status(200)
        .json({ status: false, message: "agency id not found" });
    }

    const redeem = new Redeem();

    redeem.host_id = req.body.host_id;
    redeem.agency_id = req.body.agency_id;
    redeem.description = req.body.description;
    redeem.coin = req.body.coin;
    redeem.paymentGateway = req.body.paymentGateway;

    await redeem.save();

    if (!redeem) {
      throw new Error();
    }

    host.coin = 0;
    await host.save();

    agency.redeemCoin += req.body.coin;
    await agency.save();
    return res.status(200).json({ status: true, message: "success" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//accept redeem request
exports.acceptRedeemRequest = async (req, res) => {
  try {
    const redeem = await Redeem.findById(req.params.redeem_id).populate(
      "host_id"
    );

    if (!redeem) {
      throw new Error();
    }
    if (!req.file)
      return res
        .status(200)
        .json({ status: false, message: "Please select Image!!" });
    redeem.image = req.file.path;
    redeem.accepted = !redeem.accepted;

    await redeem.save();

    if (redeem.host_id.isLogout === false && redeem.host_id.block === false) {
      const payload = {
        to: redeem.host_id.fcm_token,
        notification: {
          title: `Hello, ${redeem.host_id.name}`,
          body: "Your redeem request has been accepted :)",
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
      .json({ status: true, message: "success", data: redeem });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};
//decline redeem request
exports.declineRedeemRequest = async (req, res) => {
  try {
    const redeem = await Redeem.findById(req.params.redeem_id).populate(
      "host_id"
    );

    if (!redeem) {
      throw new Error();
    }

    redeem.decline = !redeem.decline;

    await redeem.save();

    //TODO: Pending

    const host = await Host.findById(redeem.host_id);

    if (host) {
      host.coin += redeem.coin;
      await host.save();
    }

    if (redeem.host_id.isLogout === false && redeem.host_id.block === false) {
      const payload = {
        to: redeem.host_id.fcm_token,
        notification: {
          title: `Hello, ${redeem.host_id.name}`,
          body: "Your redeem request has been decline :(",
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
      .json({ status: true, message: "success", data: redeem });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//delete accepted redeem request
exports.destroy = async (req, res) => {
  try {
    const redeem = await Redeem.findById(req.params.redeem_id);

    if (!redeem) {
      return res
        .status(200)
        .json({ status: false, message: "Redeem data Does not Exist!!" });
    }
    await redeem.deleteOne();
    return res.status(200).json({ status: true, message: "success" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

exports.agencyWisePendingRequest = async (req, res) => {
  try {
    const agency = await Agency.find();

    let agency_ = [];
    for (var i = 0; i < agency.length; i++) {
      const count = await Redeem.find({
        agency_id: agency[i]._id,
      })
        .where({ accepted: false })
        .countDocuments();

      agency_.push({
        _id: agency[i]._id,
        name: agency[i].name,
        count: count || 0,
        createdAt: agency[i].createdAt,
        updatedAt: agency[i].updatedAt,
      });
    }

    return res
      .status(200)
      .json({ status: true, message: "Success!!", data: agency_ });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

exports.agencyWiseAcceptedRequest = async (req, res) => {
  try {
    const agency = await Agency.find();

    let agency_ = [];
    for (var i = 0; i < agency.length; i++) {
      const count = await Redeem.find({
        agency_id: agency[i]._id,
      })
        .where({ accepted: true })
        .countDocuments();

      agency_.push({
        _id: agency[i]._id,
        name: agency[i].name,
        count: count || 0,
        createdAt: agency[i].createdAt,
        updatedAt: agency[i].updatedAt,
      });
    }

    return res
      .status(200)
      .json({ status: true, message: "Success!!", data: agency_ });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//get host redeem request
exports.getHostRedeemRequest = async (req, res) => {
  try {
    const host = await Host.findById(req.query.host_id);
    if (!host)
      return res
        .status(200)
        .json({ status: false, message: "Host does not Exist!!" });

    const redeem = await Redeem.find({ host_id: req.query.host_id });
    if (!redeem) {
      return res
        .status(200)
        .json({ status: true, message: "No Redeem Data Found!!" });
    }
    return res
      .status(200)
      .json({ status: true, message: "Success!!", data: redeem });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

const Redeem = require("./agencyRedeem.model");
const Agency = require("../agency/agency.model");

//get agency wise redeem request
exports.agencyWiseRedeemRequest = async (req, res) => {
  try {
    const redeem = await Redeem.find({ agency_id: req.params.agency_id }).sort({
      createdAt: -1,
    });

    if (!redeem)
      return res
        .status(200)
        .json({ status: false, message: "Redeem Request not Found!!" });

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

//get unaccepted redeem request [main admin]
exports.unacceptedRequest = async (req, res) => {
  try {
    const redeem = await Redeem.find({ accepted: false })
      .sort({ createdAt: -1 })
      .populate("agency_id");

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

//get accepted redeem request [main admin]
exports.acceptedRequest = async (req, res) => {
  try {
    const redeem = await Redeem.find({ accepted: true })
      .sort({ createdAt: -1 })
      .populate("agency_id");

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

    const agency = await Agency.findById(req.body.agency_id);

    if (!agency) {
      return res
        .status(200)
        .json({ status: false, message: "Agency Does not Exist!!" });
    }

    const redeem = new Redeem();

    redeem.agency_id = req.body.agency_id;
    redeem.description = req.body.description;
    redeem.coin = req.body.coin;
    redeem.paymentGateway = req.body.paymentGateway;

    await redeem.save();

    if (!redeem) {
      throw new Error();
    }

    agency.redeemCoin = 0;
    await agency.save();

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

//update detail of pending redeem request by admin and agency
exports.update = async (req, res) => {
  try {
    if (!req.body.paymentGateway)
      return res
        .status(200)
        .json({ status: false, message: "payment gateway required" });
    if (!req.body.description)
      return res
        .status(200)
        .json({ status: false, message: "description required" });

    const redeem = await Redeem.findById(req.params.redeem_id);

    if (!redeem) {
      return res
        .status(200)
        .json({ status: false, message: "Redeem data Does not Exist!!" });
    }

    redeem.description = req.body.description;
    redeem.paymentGateway = req.body.paymentGateway;

    await redeem.save();

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
//accept redeem request
exports.acceptRequest = async (req, res) => {
  try {
    const redeem = await Redeem.findById(req.params.redeem_id);

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

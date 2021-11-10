const Report = require("./report.model");
const User = require("../user/user.model");
const Host = require("../host/host.model");
const Agency = require("../agency/agency.model");
const mongoose = require("mongoose");

//reported user [to user]
exports.reportedUser = async (req, res) => {
  try {
    let report;
    if (req.params.agency_id.toString() === "ALL") {
      report = await Report.aggregate([
        { $group: { _id: "$host_id", count: { $sum: 1 } } },
      ]);
    } else {
      const agency = await Agency.findById(req.params.agency_id);

      if (!agency)
        return res
          .status(200)
          .json({ status: false, message: "Agency does not Exist!!" });

      report = await Report.aggregate([
        {
          $match: {
            agency_id: mongoose.Types.ObjectId(req.params.agency_id),
          },
        },
        { $group: { _id: "$host_id", count: { $sum: 1 } } },
      ]);
    }

    let data = [];

    for (let i = 0; i < report.length; i++) {
      const user = await Report.findOne({ host_id: report[i]._id }).populate(
        "host_id"
      );
      data.push({
        _id: user.host_id._id,
        name: user.host_id.name,
        image: user.host_id.image,
        username: user.host_id.username,
        country: user.host_id.country,
        coin: user.host_id.coin,
        count: report[i].count,
      });
    }

    return res.status(200).json({ status: true, message: "Success", data });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//get list of report user [from user]
exports.reportUser = async (req, res) => {
  try {
    const report = await Report.find({
      host_id: req.params.host_id,
    }).populate("user_id");

    const data = report.map((data) => ({
      _id: data.user_id._id,
      name: data.user_id.name,
      image: data.user_id.image,
      country: data.user_id.country,
      username: data.user_id.username,
      description: data.description,
    }));

    if (!report) {
      throw new Error();
    }

    return res.status(200).json({ status: true, message: "Success", data });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

exports.store = async (req, res) => {
  try {
    if (!req.body)
      return res
        .status(200)
        .json({ status: false, message: "Invalid Details!!" });
    if (!req.body.user_id)
      return res
        .status(200)
        .json({ status: false, message: "User id is Required!" });
    if (!req.body.host_id)
      return res
        .status(200)
        .json({ status: false, message: "Host id is Required!" });
    if (!req.body.agency_id)
      return res
        .status(200)
        .json({ status: false, message: "Agency id is required!" });
    if (!req.body.description)
      return res
        .status(200)
        .json({ status: false, message: "Description is Required!" });

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
    const agency = await Agency.findById(req.body.agency_id);
    if (!agency)
      return res
        .status(200)
        .json({ status: false, message: "Agency Does not Exist!!" });

    const report = new Report();

    report.user_id = req.body.user_id;
    report.host_id = req.body.host_id;
    report.agency_id = req.body.agency_id;
    report.description = req.body.description;

    await report.save();

    if (!report) {
      throw new Error();
    }

    return res.status(200).json({ status: true, message: "Success" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

const Agency = require("./agency.model");
const Host = require("../host/host.model");
const jwt = require("jsonwebtoken");
const { deleteFile } = require("../../util/deleteFile");
const fs = require("fs");
const Cryptr = require("cryptr");
const crypt = new Cryptr("myTotalySecretKey");

exports.index = async (req, res) => {
  try {
    const agency = await Agency.find({ flag: true }).sort({
      createdAt: -1,
    });

    if (!agency)
      return res
        .status(200)
        .json({ status: false, message: "Agency Not Found!!" });

    await agency.map((agency) => {
      agency.password = crypt.decrypt(agency.password);
    });

    return res
      .status(200)
      .json({ status: true, message: "Success!!", data: agency });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

exports.getprofile = async (req, res) => {
  try {
    const agency = await Agency.findById(req.agency._id);
    if (!agency) {
      return res
        .status(200)
        .json({ status: false, message: "Agency not Found!" });
    }
    return res
      .status(200)
      .json({ status: true, message: "Success!!", data: agency });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

exports.store = async (req, res) => {
  try {
    if (!req.body.name) {
      deleteFile(req.file);
      return res
        .status(200)
        .json({ status: false, message: "Name is Required!" });
    }
    if (!req.body.email) {
      deleteFile(req.file);
      return res
        .status(200)
        .json({ status: false, message: "Email is Required!" });
    }
    if (!req.body.password) {
      deleteFile(req.file);
      return res
        .status(200)
        .json({ status: false, message: "Password is Required!" });
    }
    if (!req.body.code) {
      deleteFile(req.file);
      return res
        .status(200)
        .json({ status: false, message: "Code is Required!" });
    }
    if (!req.body.mobileNo) {
      deleteFile(req.file);
      return res
        .status(200)
        .json({ status: false, message: "Mobile No is Required!" });
    }
    if (!req.file)
      return res
        .status(200)
        .json({ status: false, message: "Please Select an Image!" });

    const isAgencyCodeExist = await Agency.findOne({ code: req.body.code });

    if (isAgencyCodeExist) {
      deleteFile(req.file);
      return res
        .status(200)
        .json({ status: false, message: "Agency Code is already Exist!!" });
    }

    const agency = new Agency();

    agency.name = req.body.name;
    agency.mobileNo = req.body.mobileNo;
    agency.email = req.body.email;
    agency.code = req.body.code;
    agency.image = req.file.path;
    agency.password = crypt.encrypt(req.body.password);

    await agency.save();

    agency.password = await crypt.decrypt(agency.password);

    return res
      .status(200)
      .json({ status: true, message: "success", data: agency });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

//update all detail of agency by main admin
exports.update = async (req, res) => {
  try {
    if (!req.body.name)
      return res
        .status(200)
        .json({ status: false, message: "Name is Required!" });

    if (!req.body.email)
      return res
        .status(200)
        .json({ status: false, message: "Email is Required!" });

    if (!req.body.password)
      return res
        .status(200)
        .json({ status: false, message: "Password is Required!" });

    if (!req.body.code)
      return res
        .status(200)
        .json({ status: false, message: "Code is Required!" });

    const agency = await Agency.findById(req.params.agency_id);

    if (!agency) {
      return res
        .status(200)
        .json({ status: false, message: "Agency not Found!!" });
    }

    if (req.file) {
      if (fs.existsSync(agency.image)) {
        fs.unlinkSync(agency.image);
      }
      agency.image = req.file.path;
    }

    agency.name = req.body.name;
    agency.mobileNo = req.body.mobileNo;
    agency.email = req.body.email;
    agency.code = req.body.code;
    agency.password = crypt.encrypt(req.body.password);

    await agency.save();

    agency.password = await crypt.decrypt(agency.password);

    return res
      .status(200)
      .json({ status: true, message: "Success!!", data: agency });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//enable disable agency
exports.enableDisableAgency = async (req, res) => {
  try {
    const agency = await Agency.findById(req.params.agency_id);
    if (!agency) {
      return res
        .status(200)
        .json({ status: false, message: "agency not found" });
    }

    agency.isDisable = !agency.isDisable;
    await agency.save();

    return res
      .status(200)
      .json({ status: true, message: "success", data: agency });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    if (!req.body)
      return res
        .status(200)
        .json({ status: false, message: "Invalid details" });

    if (!req.body.name)
      return res
        .status(200)
        .json({ status: false, message: "Name is required" });

    const agency = await Agency.findById(req.agency._id);

    if (!agency) {
      return res
        .status(200)
        .json({ status: false, message: "Agency not Found!!" });
    }

    agency.name = req.body.name;

    await agency.save();

    return res
      .status(200)
      .json({ status: true, message: "Success!!", data: agency });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

exports.updateImage = async (req, res) => {
  try {
    const agency = await Agency.findById(req.agency._id);

    if (!agency) {
      return res
        .status(200)
        .json({ status: false, message: "Agency not Found!" });
    }

    if (req.file) {
      if (fs.existsSync(agency.image)) {
        fs.unlinkSync(agency.image);
      }
      agency.image = req.file.path;
    }

    await agency.save();

    return res
      .status(200)
      .json({ status: true, message: "Success!!", data: agency });
  } catch (error) {
    console.log(error);
    deleteFile(req.file);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

exports.login = async (req, res) => {
  try {
    if (!req.body)
      return res
        .status(200)
        .json({ status: false, message: "Invalid details." });
    if (!req.body.email)
      return res
        .status(200)
        .json({ status: false, message: "Email is required" });
    if (!req.body.password)
      return res
        .status(200)
        .json({ status: false, message: "Password is required" });

    const agency = await Agency.findOne({ email: req.body.email });

    if (!agency) {
      const err = new Error();
      err.status = 422;
      err.errors = [{ email: "Email does not Exist!" }];
      throw err;
    }

    if (crypt.decrypt(agency.password) !== req.body.password) {
      const err = new Error();
      err.status = 422;
      err.errors = [{ password: "Password does not match!" }];
      throw err;
    }

    const payload = {
      _id: agency._id,
      name: agency.name,
      email: agency.email,
      image: agency.image,
      code: agency.code,
      flag: agency.flag,
    };

    const token = jwt.sign(payload, "jsonWebToken");

    return res.status(200).json({ status: true, message: "Success!!", token });
  } catch (error) {
    console.log(error);
    return res.status(error.status || 500).json({
      status: false,
      error: error.errors || error.message || "server error",
    });
  }
};

exports.changePass = async (req, res) => {
  try {
    if (!req.body)
      return res
        .status(200)
        .json({ status: false, message: "Invalid details" });

    if (!req.body.oldPass)
      return res
        .status(200)
        .json({ status: false, message: "old password is required" });
    if (!req.body.password)
      return res
        .status(200)
        .json({ status: false, message: "new password is required" });

    if (!req.body.confirmPass)
      return res
        .status(200)
        .json({ status: false, message: "confirm password is required" });

    if (req.body.password !== req.body.confirmPass)
      return res.status(200).json({
        status: false,
        message: "Password Confirmation does not match password..",
      });

    const agency = await Agency.findById(req.agency._id);
    if (!agency) {
      return res.status(200).json({
        status: false,
        message: "Agency not found",
      });
    }

    agency.password = crypt.encrypt(req.body.password);

    await agency.save();

    return res.status(200).json({ status: true, message: "Success!!" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//get total coin of agency
exports.getTotalCoin = async (req, res) => {
  try {
    const agency = await Agency.findById(req.params.agency_id);
    if (!agency)
      return res
        .status(200)
        .json({ status: false, message: "Agency does not Exist!!" });

    const host = await Host.find({ agencyId: req.params.agency_id });
    agency.totalCoin = 0;
    await agency.save();

    await host.map(async (data) => {
      agency.totalCoin += data.coin;
      await agency.save();
    });

    return res
      .status(200)
      .json({ status: true, message: "Success!!", data: agency });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};
//get particular agency detail [for android]
exports.getAgency = async (req, res) => {
  try {
    const agency = await Agency.findById(req.query.agency_id);
    if (!agency)
      return res
        .status(200)
        .json({ status: false, message: "Agency does not Exist!!" });

    return res
      .status(200)
      .json({ status: true, message: "Success!!", data: agency });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

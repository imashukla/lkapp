const Level = require("./level.model");
const fs = require("fs");

exports.index = async (req, res) => {
  try {
    const level = await Level.find({ type: req.query.type }).sort({
      createdAt: -1,
    });

    if (!level) {
      throw new Error();
    }

    return res
      .status(200)
      .json({ status: true, message: "success", data: level });
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
        .json({ status: false, message: "invalid details" });
    if (!req.body.name)
      return res
        .status(200)
        .json({ status: false, message: "Name is required!" });
    if (!req.body.rupee)
      return res
        .status(200)
        .json({ status: false, message: "Rupee is required!" });
    if (!req.body.type)
      return res
        .status(200)
        .json({ status: false, message: "Type is required!" });

    const level = new Level();

    level.name = req.body.name;
    level.rupee = parseInt(req.body.rupee);
    level.type = req.body.type.trim().toLowerCase();

    await level.save();

    return res
      .status(200)
      .json({ status: true, message: "success", data: level });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

exports.update = async (req, res) => {
  try {
    if (!req.body)
      return res
        .status(200)
        .json({ status: false, message: "invalid details" });
    if (!req.body.name)
      return res
        .status(200)
        .json({ status: false, message: "Name is required!" });
    if (!req.body.rupee)
      return res
        .status(200)
        .json({ status: false, message: "Rupee is required!" });
    if (!req.body.type)
      return res
        .status(200)
        .json({ status: false, message: "Type is required!" });

    const level = await Level.findById(req.params.level_id);

    if (!level) {
      return res
        .status(200)
        .json({ status: false, message: "Level does not Exist!!" });
    }

    level.name = req.body.name;
    level.rupee = parseInt(req.body.rupee);
    level.type = req.body.type.trim().toLowerCase();

    await level.save();

    return res
      .status(200)
      .json({ status: true, message: "success", data: level });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};
exports.destroy = async (req, res) => {
  try {
    const level = await Level.findById(req.params.level_id);

    if (!level) {
      return res
        .status(200)
        .json({ status: false, message: "Level does not Exist!!" });
    }

    await level.deleteOne();

    return res.status(200).json({ status: true, message: "success" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

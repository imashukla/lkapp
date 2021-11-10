const Banner = require("./banner.model");
const { deleteFile } = require("../../util/deleteFile");
const fs = require("fs");

//get list of banner
exports.index = async (req, res) => {
  try {
    const banner = await Banner.find().sort({ createdAt: -1 });

    if (!banner) {
      return res
        .status(200)
        .json({ status: false, message: "Banner not Found!" });
    }

    return res.status(200).json({ status: true, message: "Success!!", banner });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Server Error",
    });
  }
};

//create banner
exports.store = async (req, res) => {
  try {
    if (!req.file)
      return res
        .status(200)
        .json({ status: false, message: "please select an image" });

    const banner = new Banner();

    banner.image = req.file.path;
    banner.link = req.body.link;

    await banner.save((error, banner) => {
      if (error) return res.status(200).json({ status: false, error });
      else
        return res
          .status(200)
          .json({ status: true, message: "Success!!", banner });
    });
  } catch (error) {
    console.log(error);
    deleteFile(req.file);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//update banner
exports.update = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.banner_id);

    if (!banner) {
      return res
        .status(200)
        .json({ status: false, message: "Banner not found" });
    }

    if (req.file) {
      if (fs.existsSync(banner.image)) {
        fs.unlinkSync(banner.image);
      }

      banner.image = req.file.path;
    }

    banner.link = req.body.link;

    await banner.save((error, banner) => {
      if (error) return res.status(200).json({ status: false, error });
      else
        return res
          .status(200)
          .json({ status: true, message: "Success!!", banner });
    });
  } catch (error) {
    console.log(error);
    if (req.file) {
      deleteFile(req.file);
    }
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

//delete banner
exports.destroy = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.banner_id);
    if (!banner) {
      return res
        .status(200)
        .json({ status: false, message: "Banner not found" });
    }

    if (fs.existsSync(banner.image)) {
      fs.unlinkSync(banner.image);
    }

    await banner.deleteOne();

    return res.status(200).json({ status: true, message: "Success!!" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

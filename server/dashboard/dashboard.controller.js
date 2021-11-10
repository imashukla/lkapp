const User = require("../user/user.model");
const Host = require("../host/host.model");
const Country = require("../country/country.model");
const Category = require("../category/category.model");
const Gift = require("../gift/gift.model");
const Emoji = require("../emoji/emoji.model");
const Sticker = require("../sticker/sticker.model");
const Plan = require("../plan/plan.model");
const VIPPlan = require("../VIP plan/VIPplan.model");
const Agency = require("../agency/agency.model");

exports.index = async (req, res) => {
  try {
    let total_count = {};

    total_count.user = await User.countDocuments();
    total_count.country = await Country.countDocuments();
    total_count.category = await Category.countDocuments();
    total_count.gift = await Gift.countDocuments();
    total_count.emoji = await Emoji.countDocuments();
    total_count.sticker = await Sticker.countDocuments();
    total_count.purchasePlan = await Plan.countDocuments();
    total_count.VIPPlan = await VIPPlan.countDocuments();
    total_count.host = await Host.countDocuments();
    total_count.agency = await Agency.find({ flag: true }).countDocuments();
    total_count.onlineHost = await Host.find({
      isOnline: true,
    }).countDocuments();
    total_count.liveHost = await Host.find({ isLive: true }).countDocuments();

    return res
      .status(200)
      .json({ status: true, message: "success", data: total_count });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, error: error.message || "server error" });
  }
};

exports.agencyDashboard = async (req, res) => {
  try {
    const agency = await Agency.findById(req.params.agency_id);

    if (!agency)
      return res
        .status(200)
        .json({ status: false, message: "Agency Does not Exist" });
    let total_count = {};

    total_count.onlineHost = await Host.find({
      agencyId: req.params.agency_id,
      isOnline: true,
    }).countDocuments();
    total_count.liveHost = await Host.find({
      agencyId: req.params.agency_id,
      isLive: true,
    }).countDocuments();

    return res
      .status(200)
      .json({ status: true, message: "success", data: total_count });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, error: error.message || "Server Error" });
  }
};

const User = require("../user/user.model");
const Host = require("../host/host.model");
const Follower = require("../hostFollower/hostFollower.model");
const { Mongoose } = require("mongoose");

exports.favourite = async (req, res) => {
  try {
    const user = User.findById(req.query.user_id);
    if (!user) {
      return res.status(200).json({ status: false, message: "user not found" });
    }

    Follower.find({ user_id: req.query.user_id }, { host_id: 1 })
      .populate("host_id")
      .exec(async (err, followers) => {
        if (err)
          return res
            .status(500)
            .send({ status: false, message: "Internal server error" });
        else {
          const host = await Host.find({ isLive: true }).populate(
            "hostCountry"
          );

          const list = [];
          followers.map(async (data) => {
            await host.map(async (host) => {
              if (host._id) {
                if (data.host_id._id.toString() === host._id.toString())
                  list.push({
                    image: host.image,
                    host_id: host._id,
                    name: host.name,
                    country_id: host.hostCountry ? host.hostCountry._id : "",
                    country_name: host.hostCountry ? host.hostCountry.name : "",
                    isBusy: host.isBusy,
                    coin: host.coin,
                    token: host.token,
                    channel: host.channel,
                    view: 0,
                  });
              }
            });
          });
          return res.status(200).send({
            status: true,
            message: "favorite list successful",
            data: list,
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

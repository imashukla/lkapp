const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

//socket io
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server);

app.use(express.json());
app.use(cors());

const config = require("./config");

//live view model
const LiveView = require("./server/liveView/liveView.model");

//model routes
const AdminRoute = require("./server/admin/admin.route");
app.use("/admin", AdminRoute);

//user routes
const UserRoute = require("./server/user/user.route");
app.use("/user", UserRoute);

//country routes
const CountryRoute = require("./server/country/country.route");
app.use("/country", CountryRoute);

//chat route
const ChatRoute = require("./server/chat/chat.route");
app.use("/chat", ChatRoute);

//chat topic route
const ChatTopicRoute = require("./server/chatTopic/chatTopic.route");
app.use("/chatTopic", ChatTopicRoute);

//sticker route
const StickerRoute = require("./server/sticker/sticker.route");
app.use("/sticker", StickerRoute);

//emoji route
const EmojiRoute = require("./server/emoji/emoji.route");
app.use("/emoji", EmojiRoute);

//random route
const RandomRoute = require("./server/random/random.route");
app.use("/", RandomRoute);

//live comment route
const LiveCommentRoute = require("./server/liveComment/liveComment.route");
app.use("/livecomment", LiveCommentRoute);

//live view route
const LiveViewRoute = require("./server/liveView/liveView.route");
app.use("/liveview", LiveViewRoute);

//category route
const CategoryRoute = require("./server/category/category.route");
app.use("/category", CategoryRoute);

//gift route
const GiftRoute = require("./server/gift/gift.route");
app.use("/gift", GiftRoute);

//favorite route
const FavouriteRoute = require("./server/favourite/favourite.route");
app.use("/", FavouriteRoute);

//plan route
const PlanRoute = require("./server/plan/plan.route");
app.use("/plan", PlanRoute);

//VIP plan route
const VIPPlanRoute = require("./server/VIP plan/VIPplan.route");
app.use("/VIPplan", VIPPlanRoute);

//history route
const HistoryRoute = require("./server/history/history.route");
app.use("/history", HistoryRoute);

//notification route
const NotificationRoute = require("./server/notification/notification.route");
app.use("/", NotificationRoute);

//dashboard route
const DashboardRoute = require("./server/dashboard/dashboard.route");
app.use("/dashboard", DashboardRoute);

//setting route
const SettingRoute = require("./server/setting/setting.route");
app.use("/setting", SettingRoute);

//report user route
const ReportRoute = require("./server/report/report.route");
app.use("/report", ReportRoute);

//advertisement route
const AdvertisementRoute = require("./server/advertisement/advertisement.route");
app.use("/advertisement", AdvertisementRoute);

//redeem User
const RedeemRoute = require("./server/redeem/redeem.route");
app.use("/redeem", RedeemRoute);

//host route
const HostRoute = require("./server/host/host.route");
app.use("/host", HostRoute);

//agency route
const AgencyRoute = require("./server/agency/agency.route");
app.use("/agency", AgencyRoute);

//request route
const RequestRoute = require("./server/request/request.route");
app.use("/request", RequestRoute);

//call history route
const CallHistoryRoute = require("./server/callHistory/callHistory.route");
app.use("/callHistory", CallHistoryRoute);

//user follower route
const UserFollowerRoute = require("./server/userFollower/userFollower.route");
app.use("/user", UserFollowerRoute);

//host follower route
const HostFollowerRoute = require("./server/hostFollower/hostFollower.route");
app.use("/host", HostFollowerRoute);

//level route
const LevelRoute = require("./server/level/level.route");
app.use("/level", LevelRoute);

//agency redeem route
const AgencyRedeemRoute = require("./server/agencyRedeem/agencyRedeem.route");
app.use("/agencyRedeem", AgencyRedeemRoute);

//complain route
const ComplainRoute = require("./server/complain/complain.route");
app.use("/complain", ComplainRoute);

//live streaming history route
const LiveStreamingHistoryRoute = require("./server/liveStreamingHistory/liveStreamingHistory.route");
app.use("/liveStream", LiveStreamingHistoryRoute);

//banner route
const BannerRoute = require("./server/banner/banner.route");
app.use("/banner", BannerRoute);

app.use(express.static(path.join(__dirname, "public")));
app.use("/storage", express.static(path.join(__dirname, "storage")));

app.get("/*", function (req, res) {
  res.status(200).sendFile(path.join(__dirname, "public", "index.html"));
});

mongoose.connect(
  `mongodb+srv://${config.dbusername}:${config.dbpassword}@cluster0.gqe3z.mongodb.net/${config.dbname}`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  }
);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("MONGO: successfully connected to db");
});

//socket io
io.on("connect", (socket) => {
  //call
  const { roomCall } = socket.handshake.query;

  //streaming
  const { room } = socket.handshake.query;
  const { chatroom } = socket.handshake.query;
  const { globalRoom } = socket.handshake.query;

  //call
  socket.join(roomCall);

  //streaming
  socket.join(room);
  socket.join(chatroom);
  socket.join(globalRoom);

  //call
  socket.on("vGift", (data) => {
    io.in(roomCall).emit("vGift", data);
  });
  socket.on("RequestGift", (data) => {
    io.in(roomCall).emit("RequestGift", data);
  });
  socket.on("comment", (data) => {
    console.log("comment" + data);
    io.in(roomCall).emit("comment", data);
  });

  //streaming
  socket.on("msg", (data) => {
    io.in(room).emit("msg", data);
  });

  socket.on("filter", (data) => {
    io.in(room).emit("filter", data);
  });

  socket.on("gif", (data) => {
    io.in(room).emit("gif", data);
  });

  socket.on("sticker", (data) => {
    io.in(room).emit("sticker", data);
  });

  socket.on("emoji", (data) => {
    io.in(room).emit("emoji", data);
  });

  socket.on("gift", (data) => {
    io.in(room).emit("gift", data);
  });

  socket.on("chat", async (data) => {
    io.in(chatroom).emit("chat", data);
  });

  socket.on("blockedList", (data) => {
    io.in(room).emit("blockedList", data);
  });

  socket.on("viewadd", async (data) => {
    const isUserExist = await LiveView.exists({ user_id: data.user_id });

    if (!isUserExist) {
      const view = new LiveView();

      view.user_id = data.user_id;
      view.name = data.name;
      view.image = data.image;
      view.token = data.token;

      await view.save();
    }

    const count = await LiveView.find({ token: data.token }).countDocuments();

    io.in(room).emit("view", count);
  });

  socket.on("viewless", async (data) => {
    const view = await LiveView.findOne({
      $and: [{ user_id: data.user_id }, { token: data.token }],
    });

    if (view) {
      await view.deleteOne();
    }

    const count = await LiveView.find({ token: data.token }).countDocuments();

    io.in(room).emit("view", count);
  });

  socket.on("ended", (data) => {
    io.in(room).emit("ended", data);
  });

  socket.on("refresh", (data) => {
    io.in(globalRoom).emit("refresh", data);
  });
  socket.on("call", (data) => {
    io.in(globalRoom).emit("call", data);
  });
  socket.on("callAnswer", (data) => {
    io.in(globalRoom).emit("callAnswer", data);
  });

  socket.on("disconnect", function () {
    console.log("One of sockets disconnected from our server.");
  });
});

//start the server
server.listen(config.PORT, () => {
  console.log("Magic happens on port " + config.PORT);
});

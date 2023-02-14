const eventInfo = require("../files/storage/Events/eventInfo");

module.exports = function (app) {
  app.get("/api/getEventInfo", async function (req, res) {
    res.status(200).json({
      status: "success",
      data: eventInfo,
    });
  });
};

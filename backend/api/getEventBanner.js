const { config } = require("../config");

module.exports = function (app) {
  app.get("/api/getEventBanner", async function (req, res) {
    const query = await req?.query;

    const eventName = query?.eventName || null;

    res.status(200).json({
      status: "success",
      path: `${config.static_domain}/static/events/${eventName}.png`,
    });
  });
};

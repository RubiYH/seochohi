const { config } = require("../config");
const Notice = require("../files/Notice.js");

module.exports = function (app) {
  app.get("/api/getNotice/", async function (req, res) {
    res.json({
      status: "success",
      data: Notice,
    });
  });
};

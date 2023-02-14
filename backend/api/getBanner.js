const bannerData = require("../files/bannerData");

module.exports = function (app) {
  app.get("/api/getBanner", async function (req, res) {
    try {
      res.status(200).json({
        status: "success",
        data: bannerData,
      });
    } catch (e) {
      res.json({
        status: "error",
        data: null,
      });
      console.log(e);
    }
  });
};

const FAQ_List = require("../files/FAQ_List");

module.exports = function (app) {
  app.get("/api/getSupportList", async function (req, res) {
    res.status(200).json({
      status: "success",
      data: FAQ_List,
    });
  });
};

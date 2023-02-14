const { config } = require("../config");
const PopupList = require("../files/BottomPopup.json");

module.exports = function (app) {
  app.get("/api/getBottomPopupList/", function (req, res) {
    res.json({
      status: "success",
      data: PopupList,
    });
  });
};

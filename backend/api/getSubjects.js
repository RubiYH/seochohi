const Subjects = require("../files/Subjects").Subjects;
module.exports = function (app) {
  app.get("/api/getsubjects", function (req, res) {
    try {
      res.json({
        status: "success",
        data: Subjects,
      });
    } catch (err) {
      console.log(err.toString());
      res.json({
        status: "error",
        message: "Failed to get subjects list.",
      });
    }
  });
};

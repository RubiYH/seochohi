const { getConnection } = require("./Modules/connectToMysql");

module.exports = function (app) {
  app.get("/api/getAvatarURL", async function (req, res) {
    const query = await req.query;

    let userID = parseInt(query.userID) || null;

    getConnection((connection) => {
      connection.query(
        `SELECT \`AvatarURL\` FROM \`users\` WHERE \`ID\`=${connection.escape(userID)}`,
        (err, results, field) => {
          if (err) {
            res.json({
              status: "error",
              message: err.code || null,
              fatal: err.fatal || null,
            });

            console.log(err);
            return;
          }

          if (results.length > 0) {
            res.status(200).json({
              status: "success",
              url: results[0].AvatarURL,
            });
          } else {
            res.status(200).json({
              status: "error",
            });
          }
        }
      );
    });
  });
};

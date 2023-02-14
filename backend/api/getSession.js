const authJWT = require("../Middlewares/authJWT");
const { getConnection } = require("./Modules/connectToMysql");
const getUserID = require("./utils/jwt.auth");

module.exports = function (app) {
  app.get("/api/getSession", authJWT, async function (req, res) {
    const userID = (await req?.userID) || null;

    getConnection((connection) => {
      connection.query(
        `SELECT \`Session\` FROM \`users\` WHERE \`ID\`=${connection.escape(
          userID
        )}`,
        (err, results, fields) => {
          if (err) {
            res.json({
              status: "error",
              message: err.code || null,
              fatal: err.fatal || null,
            });

            console.log(err);
            return;
          } else {
            let Session = results[0]?.Session;

            res.status(200).json({
              status: "success",
              Session: Session,
            });
          }
        }
      );
    });
  });
};

const { config } = require("../config");
const authJWT = require("../Middlewares/authJWT");
const { getConnection } = require("./Modules/connectToMysql");
const getTable = require("./Modules/getTable");

module.exports = function (app) {
  app.get("/api/getPost", authJWT, async function (req, res) {
    const query = await req.query;

    let table = query.table?.toLowerCase() || null;
    let uid = parseInt(query.uid) || null;
    let pid = parseInt(query.pid) | null;

    getConnection((connection) => {
      connection.query(
        `SELECT * FROM \`${getTable(table)}\` WHERE \`PostID\`=${connection.escape(
          pid
        )} AND \`UserID\`=${connection.escape(uid)}`,
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

          let data = [
            {
              ...results[0],
              Views: "[]",
              who_liked: "[]",
              Username: results[0]?.Username.slice(0, 1).padEnd(3, "*"),
            },
          ];

          if (results.length > 0) {
            res.status(200).json({
              status: "success",
              data: data,
            });
          } else {
            res.status(200).json({
              status: "error",
              message: "의견이 존재하지 않습니다.",
              data: [],
            });
          }
        }
      );
    });
  });
};

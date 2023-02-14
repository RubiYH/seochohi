const authJWT = require("../Middlewares/authJWT");
const getIP = require("../Middlewares/getIP");
const { getConnection } = require("./Modules/connectToMysql");
const getTable = require("./Modules/getTable");

module.exports = function (app) {
  app.delete("/api/deletePost", getIP, authJWT, async function (req, res) {
    const query = await req?.query;

    const uid = query?.uid || null;
    const pid = query?.pid || null;
    const table = getTable(query?.table) || null;

    const userID = (await req?.userID) || null;
    const username = (await req?.username) || null;

    if (parseInt(userID) !== parseInt(uid)) {
      res.json({
        status: "unauthorized",
        message: "이 의견을 삭제할 권한이 없습니다.",
      });
      return;
    }

    let trashTable;
    if (table === "event_notes") {
      trashTable = "deleted_events";
    } else {
      trashTable = "deleted_posts";
    }

    getConnection((connection) => {
      connection.query(
        `INSERT INTO \`${trashTable}\` SELECT * FROM \`${table}\` WHERE \`PostID\`=${connection.escape(
          pid
        )} AND \`UserID\`=${connection.escape(userID)}`,
        (err, results, fields) => {
          if (err) {
            res.json({
              status: "error",
              message: err.code || null,
              fatal: err.fatal || null,
            });
            console.log(err);
            return;
          }

          connection.query(
            `DELETE FROM \`${table}\` WHERE \`PostID\`=${connection.escape(
              pid
            )} AND \`UserID\`=${connection.escape(userID)}`
          );

          if (results.affectedRows > 0) {
            res.status(200).json({
              status: "success",
              message: "의견을 삭제하였습니다.",
            });

            console.log(
              `[${req?.getIP}] ${userID} ${username} : (${table}) 의견을 삭제하였습니다. [PostID: ${pid}]`
            );
          } else {
            res.json({
              status: "error",
              message: "의견이 삭제되지 않았습니다.",
            });
          }
        }
      );
    });
  });
};

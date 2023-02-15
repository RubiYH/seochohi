const { config } = require("../config");
const authJWT = require("../Middlewares/authJWT");
const getIP = require("../Middlewares/getIP");
const { getConnection } = require("./Modules/connectToMysql");
const getTable = require("./Modules/getTable");

module.exports = function (app) {
  app.delete("/api/deleteComment", getIP, authJWT, async function (req, res) {
    const query = await req?.query;

    const uid = parseInt(query?.uid) || null;
    const pid = parseInt(query?.pid) | null;

    const table = getTable(query?.table) || null;
    const commentID = Number(query?.commentID);

    const userID = (await req?.userID) || null;
    const username = (await req?.username) || null;

    getConnection((connection) => {
      connection.query(
        `SELECT \`Comments\` FROM \`${table}\` WHERE \`PostID\`=${connection.escape(
          pid
        )} AND \`UserID\`=${connection.escape(uid)}`,
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

          let getComments = JSON.parse(results[0].Comments);

          let index = getComments.findIndex(
            (c) =>
              c.userID === parseInt(userID) && c.username === username && c.commentID === commentID
          );

          if (index >= 0) {
            getComments.splice(index, 1);
          } else {
            res.json({
              status: "error",
              message: "권한이 없습니다.",
            });
            return;
          }

          connection.query(
            `UPDATE \`${table}\` SET \`Comments\`=${connection.escape(
              JSON.stringify(getComments)
            )} WHERE \`PostID\`=${connection.escape(pid)} AND \`UserID\`=${connection.escape(uid)}`,
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
                `UPDATE \`${table}\` SET \`total_comments\`=\`total_comments\` - 1 WHERE \`PostID\`=${connection.escape(
                  pid
                )} AND \`UserID\`=${connection.escape(uid)}`,
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

                  res.status(200).json({
                    status: "success",
                    message: "댓글을 삭제하였습니다.",
                  });

                  console.log(
                    `[${
                      req.getIP
                    }] ${userID} ${username} : [${table.toUpperCase()}/${pid}/${uid}] 댓글을 삭제하였습니다.`
                  );
                }
              );
            }
          );
        }
      );
    });
  });
};

const authJWT = require("../Middlewares/authJWT");
const { getConnection } = require("./Modules/connectToMysql");
const { verifyJWT } = require("./utils/jwt.utils");

module.exports = function (app) {
  app.get("/api/deleteSession", authJWT, async function (req, res) {
    const query = await req?.query;

    const userID = (await req?.userID) || null;
    // const username = (await req?.username) || null;

    //세션 삭제
    const sessionToken = query.token;

    getConnection((connection) => {
      connection.query(
        `SELECT \`Session\` FROM \`users\` WHERE \`ID\`=${connection.escape(userID)}`,
        async (err, results, fields) => {
          if (err) {
            res.json({
              status: "error",
              message: err.code || null,
              fatal: err.fatal || null,
            });

            console.log(err);
            return;
          }

          let sessionFromDB = JSON.parse(results[0]?.Session);

          let index = sessionFromDB.findIndex((s) => s?.token === sessionToken);

          if (index < 0) {
            res.json({
              status: "notFound",
              message: "세션이 존재하지 않습니다.",
            });
            return;
          }

          const sessionToken = (await req.cookies[".session"]) || null;
          //현재 세션이면
          if (sessionFromDB[index]?.token === sessionToken) {
            res.clearCookie(".session");
          }

          //세션 삭제
          sessionFromDB.splice(index, 1);

          //DB에 업데이트
          connection.query(
            `UPDATE \`users\` SET \`Session\`=${connection.escape(
              JSON.stringify(sessionFromDB)
            )} WHERE \`ID\`=${connection.escape(userID)}`,
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
                message: "세션을 삭제하였습니다.",
              });
            }
          );
        }
      );
    });
  });
};

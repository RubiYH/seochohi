const authJWT = require("../Middlewares/authJWT");
const getIP = require("../Middlewares/getIP");
const { getConnection } = require("./Modules/connectToMysql");
const { verifyJWT } = require("./utils/jwt.utils");

module.exports = function (app) {
  app.get("/api/auth", getIP, authJWT, async function (req, res) {
    const userID = (await req?.userID) || null;
    const username = (await req?.username) || null;

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

          const session =
            results?.length > 0 ? (await JSON.parse(results[0]?.Session)) || null : null;

          const sessionFromCookie = (await req.cookies[".session"]) || null;

          //세션이 유효하지 않을 때
          if (!session?.some((s) => s?.token === sessionFromCookie)) {
            res.json({
              status: "unauthorized",
              userID: null,
              username: null,
            });
            return;
          }

          //인증 완료

          connection.query(
            `SELECT \`Gender\` FROM \`users\` WHERE \`ID\`=${connection.escape(userID)}`,
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

              res.status(200).json({
                status: "success",
                userID: userID,
                username: username,
                gender: results[0]?.Gender,
              });
            }
          );
        }
      );
    });
  });
};

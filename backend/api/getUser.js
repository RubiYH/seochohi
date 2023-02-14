const authJWT = require("../Middlewares/authJWT");
const { getConnection } = require("./Modules/connectToMysql");
const { verifyJWT } = require("./utils/jwt.utils");

module.exports = function (app) {
  app.get("/api/getUser", authJWT, async function (req, res) {
    const userID = (await req?.userID) || null;
    const username = (await req?.username) || null;

    getConnection((connection) => {
      connection.query(
        `SELECT \`ID\`,\`Username\`,\`Grade\`,\`Class\`,\`StudentID\`,\`Gender\`,\`Email\`,\`Phone\`,\`Session\`,\`AvatarURL\`,\`Attributes\`,\`Favorites\`,\`CreatedAt\`,\`Settings\`,\`Status\` FROM \`users\` WHERE \`ID\`=${connection.escape(
          userID
        )} AND \`Username\`=${connection.escape(username)}`,
        async (err, results, field) => {
          if (err) {
            res.json({
              status: "error",
              message: err.code || null,
              fatal: err.fatal || null,
            });

            console.log(err);
            return;
          }

          //세션 확인
          const sessionToken = await req.cookies[".session"];
          const sessionFromDB = JSON.parse(results[0]?.Session);

          if (!sessionFromDB.some((s) => s?.token === sessionToken)) {
            res.json({
              status: "unauthorized",
              message: "세션이 유효하지 않습니다.",
            });
            return;
          }

          //현재 세션 배열의 인덱스
          const sessionIndex = sessionFromDB.findIndex(
            (s) => s?.token === sessionToken
          );

          results[0].currentSession = sessionIndex;

          res.status(200).json({
            status: "success",
            result: results[0],
          });
        }
      );
    });
  });
};

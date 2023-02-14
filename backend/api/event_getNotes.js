const authJWT = require("../Middlewares/authJWT");
const { getConnection } = require("./Modules/connectToMysql");

module.exports = function (app) {
  app.get("/api/event/getNotes/list", authJWT, async function (req, res) {
    const query = await req?.query;

    const page = parseInt(query?.page) || 1;
    const c = parseInt(query?.c) || 4;
    const tags = query?.tags || [];

    const start = (page - 1) * 6;
    const end = c + (page - 1) * 6;

    const userID = await req?.userID;
    const username = await req.username;

    getConnection((connection) => {
      connection.query(
        `SELECT \`PostID\`,\`UserID\`,\`Username\`,\`AvatarURL\`,\`Title\`,\`Images\`,\`Date\`,\`Views\`,\`Likes\`,\`who_liked\`,\`Tags\` FROM \`event_notes\` ORDER BY \`Date\` DESC LIMIT ${connection.escape(
          start
        )}, ${connection.escape(end)} `,
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
          //who_liked 리스트를 true false로 전환 & Views 리스트 삭제

          let resultModified = results;

          for (var i in resultModified) {
            const whoLiked = JSON.parse(resultModified[i].who_liked);

            if (
              whoLiked.some(
                (s) => s.userID === parseInt(userID) && s.username === username
              )
            ) {
              resultModified[i].who_liked = true;
            } else {
              resultModified[i].who_liked = false;
            }

            resultModified[i].Views = JSON.parse(resultModified[i].Views)[0];
          }

          //태그 필터
          resultModified =
            tags?.length > 0
              ? resultModified.filter((r) =>
                  JSON.parse(r?.Tags).some((s) => tags?.includes(s))
                )
              : resultModified;

          res.status(200).json({
            status: "success",
            data: resultModified,
          });
        }
      );
    });
  });
};

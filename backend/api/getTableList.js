const { getConnection } = require("./Modules/connectToMysql");
const getTable = require("./Modules/getTable");
const authJWT = require("../Middlewares/authJWT");

module.exports = function (app) {
  app.get("/api/getTableList", authJWT, async function (req, res) {
    const query = await req.query;

    getConnection(async (connection) => {
      let table = query.table?.toLowerCase() || null;
      let count = query.c || null;
      let orderType = connection.escape(query.orderBy) || null;
      let content = query.query === undefined ? null : connection.escape(query.query?.trim());
      let lastPosition = query.lastPosition || 0;
      let userID = (await connection.escape(req?.userID)) || null;
      let username = (await connection.escape(req?.username)) || null;

      let finalQuery = "";

      let limiting = `LIMIT ${parseInt(lastPosition) + parseInt(count)},${count}`;

      let orderBy;
      switch (orderType) {
        case "latest":
          orderBy = "ORDER BY `DATE` DESC";
          break;
        case "popular":
          orderBy = "ORDER BY `LIKES` DESC";
          break;
        case "oldest":
          orderBy = "ORDER BY `DATE` ASC";
          break;
        case "views":
          orderBy = "ORDER BY `VIEWS` DESC";
          break;
        default:
          orderBy = "ORDER BY `DATE` DESC";
      }

      //테이블에서 데이터 SELECT
      let type = "";
      const select = (table) => {
        return `SELECT \`PostID\`,\`UserID\`,\`Username\`,\`AvatarURL\`,\`Content\`,\`Date\`,\`Views\`,\`Likes\`,\`who_liked\`,\`total_comments\`,\`Tags\` FROM \`${table}\``;
      };

      //전체 or 주제별로
      if (table === "all") {
        type = `(${select("s1")}) UNION ALL (${select("s2")}) UNION ALL (${select("s3")})`;
      } else {
        type = select(getTable(table));
      }

      //검색
      let search = "";
      let searchAll = false;
      if (table === "all" && content !== null) {
        //전체 검색
        search = `(SELECT \`PostID\`,\`UserID\`,\`Username\`,\`AvatarURL\`,\`Content\`,\`Date\`,\`Views\`,\`Likes\`,\`who_liked\`,\`total_comments\`,\`Tags\` FROM \`s1\` WHERE \`Content\` LIKE "%${content}%") UNION ALL (SELECT \`PostID\`,\`UserID\`,\`Username\`,\`AvatarURL\`,\`Content\`,\`Date\`,\`Views\`,\`Likes\`,\`who_liked\`,\`total_comments\`,\`Tags\` FROM \`s2\` WHERE \`Content\` LIKE "%${content}%") UNION ALL (SELECT \`PostID\`,\`UserID\`,\`Username\`,\`AvatarURL\`,\`Content\`,\`Date\`,\`Views\`,\`Likes\`,\`who_liked\`,\`total_comments\`,\`Tags\` FROM \`s3\` WHERE \`Content\` LIKE "%${content}%") ${orderBy} ${limiting}`;
        searchAll = true;
      } else if (table !== "all" && content !== null) {
        //주제 내에서 검색
        search = `WHERE \`Content\` LIKE "%${content}%"`;
      } else {
        search = "";
      }

      if (searchAll) {
        finalQuery = search;
      } else {
        finalQuery = `${type} ${search} ${orderBy} ${limiting}`;
      }

      connection.query(`${finalQuery}`, (err, results, fields) => {
        if (err) {
          res.json({
            status: "error",
            message: err.code || null,
            fatal: err.fatal || null,
          });

          console.log(err);
          return;
        }
        //who_liked 리스트를 true false로 전환 & Views 삭제

        let resultModified = results;

        for (var i in resultModified) {
          const whoLiked = JSON.parse(resultModified[i].who_liked);

          if (
            whoLiked.some((s) => parseInt(s.userID) === parseInt(userID) && s.username === username)
          ) {
            resultModified[i].who_liked = true;
          } else {
            resultModified[i].who_liked = false;
          }

          resultModified[i].Views = null;

          if (resultModified[i].Content.length > 30) {
            resultModified[i].Content = `${resultModified[i].Content.slice(0, 30)}...`;
          }

          //이름 및 학번 가리기

          resultModified[i].Username = resultModified[i].Username.slice(0, 1).padEnd(3, "*");
        }

        res.status(200).json({
          status: "success",
          data: resultModified,
        });
      });
    });
  });
};

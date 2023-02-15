const { getConnection } = require("./Modules/connectToMysql");
const { format } = require("date-fns");
const getTable = require("./Modules/getTable");
const authJWT = require("../Middlewares/authJWT");

module.exports = function (app) {
  app.post("/api/sendComment", authJWT, async function (req, res) {
    const data = req.body;

    const userID = (await req?.userID) || null;
    const username = (await req?.username) || null;

    getConnection((connection) => {
      connection.query(
        `SELECT \`Comments\` FROM \`${getTable(data.table)}\` WHERE \`PostID\`=${connection.escape(
          data.postID
        )} AND \`UserID\`=${connection.escape(data.postUserID)}`,
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

          const fetchedPost = results[0];
          const getComments = JSON.parse(fetchedPost.Comments);

          connection.query(
            `SELECT \`AvatarURL\` FROM \`users\` WHERE \`ID\`=${connection.escape(
              userID
            )} AND \`Username\`=${connection.escape(username)}`,
            (err, results, fields) => {
              const AvatarURL = results[0].AvatarURL;

              const newComment = {
                userID: parseInt(userID),
                username: username,
                AvatarURL: AvatarURL,
                comment: String(data.comment),
                commentID: Number(`${data.postID}${data.postUserID}${new Date().getTime()}`),
                Date: format(new Date(), "yy/MM/dd hh:mm:ss"),
                rawDate: new Date().toString(),
              };

              //새 array 생성 후 시간순으로 정렬
              const mergedComments = [...getComments, newComment].sort((a, b) => {
                return new Date(b.rawDate) - new Date(a.rawDate);
              });

              const total_comments = mergedComments.length;

              connection.query(
                `UPDATE \`${getTable(data.table)}\` SET \`Comments\`=${connection.escape(
                  JSON.stringify(mergedComments)
                )} WHERE \`PostID\`=${connection.escape(
                  data.postID
                )} AND \`UserID\`=${connection.escape(data.postUserID)}`,
                (err, results, fields) => {
                  if (err || results.affectedRows < 1) {
                    res.json({
                      status: "error",
                      message: err.code || null,
                      fatal: err.fatal || null,
                    });
                    console.log(err);
                    return;
                  }

                  //총 댓글 개수 추가
                  connection.query(
                    `UPDATE \`${getTable(data.table)}\` SET \`total_comments\`=${connection.escape(
                      total_comments
                    )} WHERE \`PostID\`=${connection.escape(
                      data.postID
                    )} AND \`UserID\`=${connection.escape(data.postUserID)}`,
                    (err, results, fields) => {
                      if (err || results.affectedRows < 1) {
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
                        message: "댓글을 등록하였습니다.",
                      });
                    }
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

const getIP = require("../Middlewares/getIP");
const { getConnection } = require("./Modules/connectToMysql");
const { verifyJWT } = require("./utils/jwt.utils");
const getTable = require("./Modules/getTable");
const fs = require("graceful-fs");
const { config } = require("../config");
const { limiter } = require("./Modules/rateLimit");
const authJWT = require("../Middlewares/authJWT");

module.exports = function (app) {
  app.post("/api/event/notes/post", getIP, authJWT, limiter, async function (req, res) {
    const data = await req.body;

    const title = data?.title;
    const images = data?.images;

    const userID = (await req?.userID) || null;
    const username = (await req?.username) || null;

    const Tags = data?.tags;

    //PostID 가져오기
    getConnection((connection) => {
      connection.query(`SELECT * FROM \`count\``, (err, results, fields) => {
        if (err) {
          res.json({
            status: "error",
            message: err.code || null,
            fatal: err.fatal || null,
          });
          console.log(err);
          return;
        }

        let PostID =
          results[0]["Event_PostCount"] === null ? 1 : parseInt(results[0]["Event_PostCount"]) + 1;

        let AvatarURL;
        //아바타 url 가져오기
        getConnection((connection) => {
          connection.query(
            `SELECT \`AvatarURL\` FROM \`users\` WHERE \`ID\`=${connection.escape(
              userID
            )} AND \`Username\`=${connection.escape(username)}`,
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

              AvatarURL = results[0].AvatarURL;

              //이미지
              let imageURLs = [];
              let c = 0;
              let cl = 0;

              if (images.length > 0) {
                images.forEach((i) => {
                  let imgBase64 = i.data_url.split(",")[1];

                  //확장자 추출

                  let extension;
                  extension = ".jpg";

                  let imgFromBase64 = Buffer.from(imgBase64, "base64");

                  cl++;

                  //이미지 저장
                  fs.writeFile(
                    `./files/storage/Events/Notes/${PostID}_${userID}_${cl}` + extension,
                    imgFromBase64,
                    function (err) {
                      if (err) {
                        console.log(err);
                        res.json({
                          status: "error",
                          message: "이미지를 업로드하는 도중 오류가 발생하였습니다.",
                        });
                        return;
                      }

                      if (c + 1 === images.length || images.length < 1) {
                        imageURLs.push(
                          `${config.static_domain}/static/events/notes/${PostID}_${userID}_${
                            c + 1
                          }${extension}`
                        );
                        //finished

                        postNew(PostID, userID, username, AvatarURL, title, imageURLs);
                      } else {
                        imageURLs.push(
                          `${config.static_domain}/static/events/notes/${PostID}_${userID}_${
                            c + 1
                          }${extension}`
                        );
                        c++;
                      }
                    }
                  );
                });
              } else {
                postNew(PostID, userID, username, AvatarURL, title, imageURLs);
              }
            }
          );
        });
      });
    });

    function postNew(PostID, userID, username, AvatarURL, title, images) {
      //게시물 등록
      getConnection((connection) => {
        connection.query(
          `INSERT INTO \`event_notes\` (PostID, UserID, Username, AvatarURL, Title, Images, Date, Views, Likes, who_liked, Tags) VALUES (${connection.escape(
            PostID
          )}, ${connection.escape(userID)}, ${connection.escape(username)}, ${connection.escape(
            AvatarURL
          )}, ${connection.escape(title)}, ${connection.escape(
            JSON.stringify(images)
          )}, CURRENT_TIMESTAMP(), '[0,[]]', 0, '[]', ${connection.escape(JSON.stringify(Tags))})`,
          (err, results, fields) => {
            if (err) {
              console.log(err);
              res.json({
                status: "error",
                message: "게시물 등록 중 오류가 발생하였습니다.",
              });
              return;
            }

            res.status(200).json({
              status: "success",
              message: "새 게시물을 등록하였습니다.",
            });

            //PostID 저장
            getConnection((connection) => {
              connection.query(
                `UPDATE \`count\` SET \`Event_PostCount\`=${connection.escape(PostID)}`
              );
            });

            console.log(
              `[${req.getIP}] ${userID} ${username} : (필기공유) 새 필기노트 등록 완료. [PostID: ${PostID}]`
            );
          }
        );
      });
    }
  });
};

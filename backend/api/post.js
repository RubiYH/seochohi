const getIP = require("../Middlewares/getIP");
const { getConnection } = require("./Modules/connectToMysql");
const { verifyJWT } = require("./utils/jwt.utils");
const getTable = require("./Modules/getTable");
const fs = require("graceful-fs");
const { config } = require("../config");
const { limiter } = require("./Modules/rateLimit");
const authJWT = require("../Middlewares/authJWT");

module.exports = function (app) {
  app.post(
    "/api/forest/post",
    getIP,
    authJWT,
    limiter,
    async function (req, res) {
      // console.log(req.body);

      const data = await req.body;
      // console.log(query);

      const category = getTable(data?.category);
      const content = data?.content;
      const images = data?.images;

      const userID = (await req?.userID) || null;
      const username = (await req?.username) || null;

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
          } else {
            let PostID =
              results[0]["Forest_PostCount"] === null
                ? 1
                : parseInt(results[0]["Forest_PostCount"]) + 1;

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
                  } else {
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
                        //! 확장자 뛰바뀌는 현상있음
                        // switch (i.data_url.split(",")[0]) {
                        //   case "data:image/png;base64":
                        //     extension = ".png";
                        //     break;
                        //   case "data:image/jpeg;base64":
                        //     extension = ".jpeg";
                        //     break;
                        //   case "data:image/jpg;base64":
                        //     extension = ".jpg";
                        //     break;
                        //   case "data:image/gif;base64":
                        //     extension = ".gif";
                        //     break;
                        //   default:
                        //     extension = ".jpg";
                        //     break;
                        // }

                        extension = ".jpg";

                        let imgFromBase64 = Buffer.from(imgBase64, "base64");

                        cl++;
                        //이미지 저장
                        fs.writeFile(
                          `./files/storage/${category}/${PostID}_${userID}_${cl}` +
                            extension,
                          imgFromBase64,
                          function (err) {
                            if (err) {
                              console.log(err);
                              res.json({
                                status: "error",
                                message:
                                  "이미지를 업로드하는 도중 오류가 발생하였습니다.",
                              });
                              return;
                            } else {
                              if (
                                c + 1 === images.length ||
                                images.length < 1
                              ) {
                                imageURLs.push(
                                  `${
                                    config.static_domain
                                  }/static/${category}/${PostID}_${userID}_${
                                    c + 1
                                  }${extension}`
                                );
                                //finished

                                //console.log(imageURLs);

                                postNew(
                                  category,
                                  PostID,
                                  userID,
                                  username,
                                  AvatarURL,
                                  content,
                                  imageURLs
                                );
                              } else {
                                imageURLs.push(
                                  `${
                                    config.static_domain
                                  }/static/${category}/${PostID}_${userID}_${
                                    c + 1
                                  }${extension}`
                                );
                                c++;
                              }
                            }
                          }
                        );
                      });
                    } else {
                      postNew(
                        category,
                        PostID,
                        userID,
                        username,
                        AvatarURL,
                        content,
                        imageURLs
                      );
                    }
                  }
                }
              );
            });
          }
        });
      });

      function postNew(
        category,
        PostID,
        userID,
        username,
        AvatarURL,
        content,
        images
      ) {
        //의견 등록
        getConnection((connection) => {
          connection.query(
            `INSERT INTO \`${category}\` (PostID, UserID, Username, AvatarURL, Content, Comments, Images, Date, Views, Likes, who_liked, total_comments, Tags) VALUES (${connection.escape(
              PostID
            )}, ${connection.escape(userID)}, ${connection.escape(
              username
            )}, ${connection.escape(AvatarURL)}, ${connection.escape(
              content
            )}, '[]', ${connection.escape(
              JSON.stringify(images)
            )}, CURRENT_TIMESTAMP(), '[0,[]]', 0, '[]', 0, ${connection.escape(
              category
            )})`,
            (err, results, fields) => {
              if (err) {
                console.log(err);
                res.json({
                  status: "error",
                  message: "의견 등록 중 오류가 발생하였습니다.",
                });
                return;
              } else {
                res.status(200).json({
                  status: "success",
                  message: "새 의견을 등록하였습니다.",
                });

                //PostID 저장
                getConnection((connection) => {
                  connection.query(
                    `UPDATE \`count\` SET \`Forest_PostCount\`=${connection.escape(
                      PostID
                    )}`
                  );
                });

                console.log(
                  `[${
                    req.getIP
                  }] ${userID} ${username} : (${category.toUpperCase()}) 새 의견 등록 완료. [PostID: ${PostID}]`
                );
              }
            }
          );
        });
      }
    }
  );
};
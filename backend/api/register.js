const getIP = require("../Middlewares/getIP");
const { agentInfo } = require("./Modules/agentInfo");
const { getConnection } = require("./Modules/connectToMysql");
const encryptText = require("./Modules/encrypt");
const { limiter } = require("./Modules/rateLimit");
const crypto = require("crypto");
const fs = require("fs");
const { sendEmail } = require("./Modules/sendEmail");

module.exports = function (app) {
  app.post("/api/register", getIP, limiter, async function (req, res) {
    const data = req.body;

    //중복 감지
    getConnection((connection) => {
      connection.query(
        `SELECT * FROM \`users\` WHERE \`Grade\`=${connection.escape(
          data.grade
        )} AND \`Class\`=${connection.escape(data.class)} AND \`StudentID\`=${connection.escape(
          data.studentID
        )}`,
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

          if (results.length > 0) {
            res.status(200).json({
              status: "alreadyExists",
              message: "이미 가입한 학생입니다. 본인이 가입한 적이 없다면 문의해주세요.",
            });
            return;
          }

          const ID = `${data.grade}${
            `${data.class}`.length === 1 ? `0${data.class}` : `${data.class}`
          }${`${data.studentID}`.length === 1 ? `0${data.studentID}` : `${data.studentID}`}`;

          connection.query(
            `SELECT * FROM \`pending_users\` WHERE \`ID\`=${connection.escape(ID)}`,
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

              //이미 가입 승인 대기중
              if (results.length > 0) {
                res.json({
                  status: "pending",
                  message:
                    "가입 승인 대기 중입니다. 본인이 가입 요청을 하지 않은 경우 shs.startup@gmail.com으로 문의해주세요.",
                });
                return;
              }

              //가입 승인 대기열 추가

              let avatarurl;
              if (data.gender === "m") {
                avatarurl = "https://cdn-icons-png.flaticon.com/512/257/257634.png";
              } else if (data.gender === "f") {
                avatarurl = "https://cdn-icons-png.flaticon.com/512/257/257651.png";
              }

              const attributes = {
                role: "student",
                id: data.ID,
              };

              const favorites = JSON.stringify([]);

              const settings = {
                theme: "light",
              };

              //세션
              const session_token = crypto.randomBytes(20).toString("hex");
              const Session = [
                {
                  agent: agentInfo(req),
                  token: session_token,
                  IP: req.getIP,
                  Date: new Date(),
                  hasRegistered: true,
                },
              ];

              //세션 토큰 쿠키 설정
              res.cookie(".session", session_token, {
                httpOnly: true,
                maxAge: 31556926000, //1년
              });

              //비밀번호 암호화
              const [salt, encrypted] = encryptText(`${data.password}`);

              connection.query(
                `INSERT INTO \`pending_users\` (ID, Username, Grade, Class, StudentID, Gender, Email, Phone, Password, Salt, Session, AvatarURL, Attributes, Favorites, CreatedAt, Settings, Status) VALUES (${connection.escape(
                  ID
                )},${connection.escape(data.username.trim())}, ${connection.escape(
                  data.grade
                )}, ${connection.escape(data.class)}, ${connection.escape(
                  data.studentID
                )}, ${connection.escape(data.gender)}, ${connection.escape(
                  data.email
                )}, ${connection.escape(data.phone)}, ${connection.escape(
                  encrypted
                )}, ${connection.escape(salt)}, ${connection.escape(
                  JSON.stringify(Session)
                )}, ${connection.escape(avatarurl)}, ${connection.escape(
                  JSON.stringify(attributes)
                )}, ${connection.escape(favorites)},CURRENT_TIMESTAMP(), ${connection.escape(
                  JSON.stringify(settings)
                )},'Active')`,
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

                  //학생증 저장
                  let StudentCard = data?.StudentCard[0]["img_url"];
                  let imgBase64 = StudentCard.split(",")[1];

                  let extension = ".jpg";
                  let imgFromBase64 = Buffer.from(imgBase64, "base64");

                  fs.writeFile(
                    `./files/student_card/${ID}${extension}`,
                    imgFromBase64,
                    function (err) {
                      if (err) {
                        console.log(err);
                        res.json({
                          status: "error",
                          message: "오류가 발생하였습니다.",
                        });
                        return;
                      }

                      console.log(`${ID}: 학생증 카드 사진 저장 완료.`);
                    }
                  );

                  //.pending_id 에 학번 저장해놓기
                  res.cookie(".pending_id", ID, {
                    maxAge: 604800000, //1 week
                    httpOnly: true,
                  });

                  res.status(200).json({
                    status: "success",
                    message: "회원가입 승인 대기 중입니다.",
                  });

                  console.log(`${ID} ${data.username} : 회원가입 완료: 승인 대기 중.`);

                  //이메일 전송
                  sendEmail({
                    to: "shs.startup@gmail.com",
                    title: `[서초하이] 새 회원가입 요청 - ${ID} ${data.username}`,
                    html: `
                          <h2>새 회원가입 요청이 있습니다.</h2>
                          <p>학번: ${ID}</p>
                          <p>이름: ${data.username}</p>
                          `,
                  });
                }
              );
            }
          );
        }
      );
    });
  });
};

const { config } = require("../config");
const getIP = require("../Middlewares/getIP");
const { getConnection } = require("./Modules/connectToMysql");
const encryptText = require("./Modules/encrypt");
const { signJWT } = require("./utils/jwt.utils");
const Cache = require("./Modules/cache");
const crypto = require("crypto");

module.exports = function (app) {
  app.post("/api/login", getIP, async function (req, res) {
    const data = req.body;

    if (data.id?.length < 1 || data.password?.length < 1 || data?.keepLoggedIn === null) {
      res.status(400).json({
        status: "error",
        message: "잘못된 요청입니다.",
      });

      return;
    }

    //로그인 성공 시

    const ID = parseInt(data.id);

    getConnection((connection) => {
      connection.query(
        `SELECT \`Password\`, \`Salt\` FROM \`users\` WHERE \`ID\`=${connection.escape(ID)}`,
        (err, results, field) => {
          if (err) {
            res.json({
              status: "error",
              message: err.code || null,
              fatal: err.fatal || null,
            });
            console.log(err);
            return;
          }

          //비밀번호 비교

          if (results?.length > 0) {
            const encrypted = results[0].Password;
            const salt = results[0].Salt;

            //입력한 비밀번호를 바탕으로 암호화
            const [getSalt, getEncrypted] = encryptText(data.password, salt);

            if (encrypted !== getEncrypted) {
              res.status(200).json({
                status: "unauthorized",
                message: "학번 또는 비밀번호가 일치하지 않습니다.",
              });
              return;
            }

            //로그인 승인
            connection.query(
              `SELECT \`Username\`, \`Session\` FROM \`users\` WHERE \`ID\`=${connection.escape(
                ID
              )}`,
              (err, results, field) => {
                if (err) {
                  res.json({
                    status: "error",
                    message: err.code || null,
                    fatal: err.fatal || null,
                  });
                  console.log(err);
                  return;
                }

                const userID = ID;
                const username = results[0]?.Username || null;

                //access token
                const accessToken = signJWT(
                  {
                    userID: userID,
                    username: username,
                  },
                  config.settings.accessTokenDuration
                );

                //캐시 저장
                Cache.set(`${userID}-auth`, {
                  keepLoggedIn: data?.keepLoggedIn,
                  at: accessToken,
                });

                let Session = JSON.parse(results[0]?.Session) || [];

                //! 세션 토큰이 없거나 다를 경우
                if (!Session.some((s) => s.token === req.cookies[".session"])) {
                  //임시로 userID를 httpOnly로 쿠키 설정
                  res.cookie(".id", userID, {
                    httpOnly: true,
                  });

                  const rt = crypto.randomBytes(20).toString("hex"); //임의의 페이지 접근을 방지하기 위한 무작위 토큰
                  Cache.set(`${userID}-rt`, rt);

                  res.status(200).json({
                    status: "newSession",
                    message: "새로운 환경에서 로그인하였습니다.",
                    rt: rt,
                  });
                } else {
                  //로그인 유지하기
                  if (data?.keepLoggedIn === true) {
                    //토큰 쿠키에 저장
                    res.cookie(".at", accessToken, {
                      maxAge: 31556926000, //1년
                      httpOnly: true,
                    });
                  } else {
                    res.cookie(".at", accessToken, {
                      httpOnly: true,
                    });
                  }

                  res.clearCookie(".id"); //.id 쿠키 제거
                  if (req?.cookies[".pending_id"]) {
                    res.clearCookie(".pending_id");
                  } //가입 대기 쿠키 제거

                  //로그인 성공
                  res.status(200).json({
                    status: "success",
                    message: "로그인에 성공하였습니다.",
                    token: accessToken,
                  });

                  console.log(`[${req.getIP}] ${userID} ${username} : 로그인 완료`);
                }
              }
            );
          } else {
            //가입하지 않았을 경우

            //pending_users 에서 확인
            connection.query(
              `SELECT \`Password\`, \`Salt\` FROM \`pending_users\` WHERE \`ID\`=${connection.escape(
                ID
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

                if (results?.length > 0) {
                  const encrypted = results[0].Password;
                  const salt = results[0].Salt;

                  //입력한 비밀번호를 바탕으로 암호화
                  const [getSalt, getEncrypted] = encryptText(data.password, salt);
                  if (encrypted === getEncrypted) {
                    //가입 승인 대기 중임
                    res.status(200).json({
                      status: "pending",
                      message: "가입 승인 대기 중입니다.",
                    });
                  } else {
                    res.status(200).json({
                      status: "unauthorized",
                      message: "학번 또는 비밀번호가 일치하지 않습니다.",
                    });
                  }
                } else {
                  res.status(200).json({
                    status: "notRegistered",
                    message: "학번 또는 비밀번호가 일치하지 않습니다.",
                  });
                }
              }
            );
          }
        }
      );
    });
  });
};

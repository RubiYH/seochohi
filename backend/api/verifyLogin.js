const { config } = require("../config");
const { getConnection } = require("./Modules/connectToMysql");
const { sendEmail } = require("./Modules/sendEmail");
const Cache = require("./Modules/cache");
const { agentInfo } = require("./Modules/agentInfo");
const getIP = require("../Middlewares/getIP");
const { limiter } = require("./Modules/rateLimit");
const crypto = require("crypto");
const Firebase = require("./FireBase/init");

module.exports = function (app) {
  app.get("/api/init/verify", async function (req, res) {
    const query = await req.query;

    let userID = (await req.cookies[".id"]) || null;
    let rt = query?.rt || null;

    //임의의 페이지 접근 방지
    if (rt !== Cache.get(`${userID}-rt`)) {
      res.clearCookie(".id");
      res.json({
        status: "unauthorized",
        message: "잘못된 접근입니다.",
      });

      Cache.del(`${userID}-rt`); //rt 삭제
      return;
    }

    if (!userID || userID === null) {
      res.clearCookie(".id");
      res.json({
        status: "expired",
        message: "인증 정보가 만료되었습니다.",
      });

      return;
    }

    getConnection((connection) => {
      connection.query(
        `SELECT \`Username\`, \`Email\`, \`Phone\` FROM \`users\` WHERE \`ID\`=${connection.escape(
          userID
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

          const email = results[0]?.Email || null;
          const phone = results[0]?.Phone || null;
          const username = results[0]?.Username || null;

          res.status(200).json({
            status: "success",
            email: email,
            phone: phone,
            username: username,
          });
        }
      );
    });
  });

  app.get("/api/verifyLogin", limiter, async function (req, res) {
    const query = await req.query;

    let userID = (await req.cookies[".id"]) || null;
    let method = query?.method || null;

    if (!userID || userID === null) {
      res.clearCookie(".id");
      res.json({
        status: "expired",
        message: "인증 정보가 만료되었습니다.",
      });
      return;
    }

    //인증 방식 switch
    switch (method) {
      case "byEmail":
        let email = query?.email || null;

        //userID로 이메일 가져와서 일치하는지 확인
        getConnection((connection) => {
          connection.query(
            `SELECT \`Email\` FROM \`users\` WHERE \`ID\`=${connection.escape(userID)}`,
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

              //일치하지 않으면
              if (email === null || results[0]?.Email !== email) {
                res.clearCookie(".id");
                res.json({
                  status: "unauthorized",
                  message: "인증 정보가 유효하지 않습니다.",
                });
                return;
              }

              //난수 생성
              const randomInt = Math.floor(100000 + Math.random() * 900000);

              //메모리에 저장
              Cache.set(`${userID}-verifycode`, randomInt, 3 * 60); // 3분 후 초기화

              //이메일 전송
              sendEmail({
                to: email,
                title: "[서초하이] 새로운 환경에서 로그인: 이메일 본인인증 코드",
                html: `
                <h2>새로운 환경에서 로그인이 감지되었습니다.</h2>
                <span>아래 코드를 입력하여 본인인증을 진행하세요.</span>
                <br />
                <strong>${randomInt}</strong>
                `,
              });

              res.status(200).json({
                status: "success",
                message: "인증 코드를 발송하였습니다.",
                from: config.email.email,
                to: email,
              });
            }
          );
        });
        break;

      default:
        res.json({
          status: "error",
          message: "인증 방식을 선택해주세요.",
        });
        break;
    }
  });

  //? 이메일 인증 코드 확인
  app.get("/api/verify/email", getIP, async function (req, res) {
    const query = await req?.query;

    const code = query?.code || null;
    const userID = (await req.cookies[".id"]) || null;

    if (!userID || userID === null || !Cache.get(`${userID}-verifycode`)) {
      res.clearCookie(".id");
      res.json({
        status: "expired",
        message: "인증 정보가 만료되었습니다.",
      });

      return;
    }

    if (Cache.get(`${userID}-verifycode`) === Number(code)) {
      //인증번호가 일치하면
      Cache.del(`${userID}-verifycode`);
      Cache.del(`${userID}-rt`); //rt 삭제

      //인증 완료
      authComplete(req, res, userID);
    } else {
      res.json({
        status: "wrong",
        message: "인증번호가 올바르지 않습니다.",
      });
    }
  });

  //? 휴대전화 인증 완료
  app.post("/api/verify/phone", getIP, async function (req, res) {
    const userID = (await req.cookies[".id"]) || null;

    const data = await req?.body;

    const uid = data?.uid;
    const accessToken = data?.accessToken;

    const userInfo = await Firebase.auth().getUser(uid);
    const userByToken = await Firebase.auth().verifyIdToken(accessToken);

    if (uid === userByToken?.uid && userInfo?.phoneNumber === userByToken.phone_number) {
      //폰 인증 완료
      authComplete(req, res, userID);
    } else {
      res.clearCookie(".id");

      res.json({
        status: "unauthorized",
        message: "인증 정보가 유효하지 않습니다.",
      });
    }
  });

  //? 세션에 IP 및 토큰 저장
  function addSession(req, res, userID, session_token) {
    getConnection((connection) => {
      connection.query(
        `SELECT \`Session\` FROM \`users\` WHERE \`ID\`=${connection.escape(userID)}`,
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

          let Session = JSON.parse(results[0].Session) || [];

          Session.push({
            agent: agentInfo(req),
            IP: req.getIP || null,
            token: session_token,
            Date: new Date(),
          });

          //세션 정보 DB에 저장
          connection.query(
            `UPDATE \`users\` SET \`Session\` = ${connection.escape(
              JSON.stringify(Session)
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

              console.log(`${userID} : 새 세션 정보를 DB에 저장하였습니다.`);
              console.log(`[${req.getIP}] ${userID} : 로그인 완료`);
            }
          );
        }
      );
    });
  }

  //? 인증 완료 후 실행
  async function authComplete(req, res, userID) {
    let keepLoggedIn = await Cache.get(`${userID}-auth`)?.keepLoggedIn;
    let accessToken = await Cache.get(`${userID}-auth`)?.at;

    //로그인 유지하기
    if (keepLoggedIn === true) {
      //acccess token 쿠키에 저장
      res.cookie(".at", accessToken, {
        maxAge: 31556926000, //1년
        httpOnly: true,
      });
    } else {
      res.cookie(".at", accessToken, {
        httpOnly: true,
      });
    }

    //세션 토큰
    const session_token = crypto.randomBytes(20).toString("hex");

    //세션 토큰 쿠키 저장
    res.cookie(".session", session_token, {
      httpOnly: true,
      maxAge: 31556926000, //1년
    });

    addSession(req, res, userID, session_token);

    //.id 쿠키 제거
    res.clearCookie(".id");

    res.status(200).json({
      status: "success",
      message: "인증되었습니다.",
    });
  }
};

const getIP = require("../Middlewares/getIP");
const { getConnection } = require("./Modules/connectToMysql");
const { signJWT, verifyJWT } = require("./utils/jwt.utils");
const Cache = require("./Modules/cache");

module.exports = function (app) {
  app.get("/api/logout", getIP, async function (req, res) {
    //JWT에서 ID 및 이름 가져오기
    const accessToken = await req.cookies[".at"];

    if (!accessToken) {
      res.status(200).json({
        status: "unauthorized",
        message: "이미 로그아웃되었습니다.",
      });
      return;
    }

    const verifyAccess = verifyJWT(accessToken);

    //토큰값이 유효하지 않을 때
    if (verifyAccess.payload === null) {
      res.json({
        status: "invalid",
        userID: null,
        username: null,
        expired: verifyAccess.expired,
      });
      return;
    }

    const { userID, username } = verifyAccess.payload;

    //access token 쿠키 삭제
    try {
      res.clearCookie(".at");
      //캐시 삭제
      Cache.del(`${userID}-auth`);
    } catch (err) {
      if (err) {
        console.log(err);
        res.json({
          status: "error",
          message: `오류가 발생하였습니다: ${err.toString()}`,
        });
        return;
      }
    }

    res.status(200).json({
      status: "success",
      message: "로그아웃하였습니다.",
    });

    console.log(`[${req.getIP}] ${userID} ${username} : 로그아웃 완료`);
  });
};

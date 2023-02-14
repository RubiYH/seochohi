const { getConnection } = require("../api/Modules/connectToMysql");
const { verifyJWT } = require("../api/utils/jwt.utils");

module.exports = async function (req, res, next) {
  const accessToken = (await req?.cookies?.[".at"]) || null;

  const pendingID = (await req?.cookies[".pending_id"]) || null;

  //가입 대기 중일 경우
  if (!accessToken && pendingID) {
    return getConnection((connection) => {
      connection.query(
        `SELECT \`ID\` FROM \`pending_users\` WHERE \`ID\`=${connection.escape(
          pendingID
        )}`,
        (err, results, fields) => {
          if (err) {
            res.json({
              status: "error",
              message: "오류가 발생하였습니다.",
            });
            return;
          }

          if (results.length > 0) {
            //가입 대기중입니다
            res.json({
              status: "unauthorized",
              pending: true,
              userID: null,
              username: null,
            });
          } else {
            res.json({
              status: "unauthorized",
              userID: null,
              username: null,
              message: "로그인이 필요합니다.",
            });
          }

          return;
        }
      );
    });
  }

  if (!accessToken || accessToken === undefined) {
    res.json({
      status: "unauthorized",
      userID: null,
      username: null,
      message: "로그인이 필요합니다.",
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

  req.userID = userID;
  req.username = username;

  next();
};

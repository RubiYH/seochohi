const authJWT = require("../Middlewares/authJWT");
const { getConnection } = require("./Modules/connectToMysql");

module.exports = function (app) {
  app.get("/api/getNotes", authJWT, async function (req, res) {
    const query = await req.query;

    const userID = (await req?.userID) || null;
    const type = query.type || null;
    const id = query.id || null;

    getConnection((connection) => {
      connection.query(
        `SELECT \`Notes\` FROM \`quicknotes\` WHERE \`ID\`=${connection.escape(userID)}`,
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

          if (results.length < 1) {
            res.json({
              status: "empty",
              message: "메모가 없습니다. 아래 '연필' 아이콘을 눌러 새 메모를 작성하세요.",
            });
            return;
          }

          let result = [];

          switch (type) {
            case "list":
              results.forEach((r) => {
                result.push(
                  JSON.parse(r.Notes, (key, value) => {
                    if (key === "content") return undefined;

                    return value;
                  })[0]
                );
              });

              res.json({
                status: "success",
                data: result,
                message: `${result.length}개의 메모`,
              });
              break;

            case "view":
              let result = results.find((r) => JSON.parse(r.Notes)[0].id === parseInt(id));

              res.json({
                status: "success",
                data: JSON.parse(result.Notes)[0],
              });
              break;

            default:
              res.json({
                status: "error",
                message: "메모를 찾을 수 없습니다.",
              });
              break;
          }
        }
      );
    });
  });
};

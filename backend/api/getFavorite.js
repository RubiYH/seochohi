const { getConnection } = require("./Modules/connectToMysql");
const getTable = require("./Modules/getTable");

module.exports = function (app) {
  app.get("/api/getfavorites", async function (req, res) {
    const query = await req.query;

    let userID = query?.userID || null;
    let username = query?.username || null;
    let table = getTable(query?.table) || null;

    getConnection((connection) => {
      connection.query(
        `SELECT \`Favorites\` FROM \`users\` WHERE \`ID\`=${connection.escape(
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

          res.status(200).json({
            status: "success",
            list: JSON.parse(results[0].Favorites).filter((f) => f.table === table),
          });
        }
      );
    });
  });
};

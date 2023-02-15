const { config } = require("../config");
const authJWT = require("../Middlewares/authJWT");
const { getConnection, getConnection_TT } = require("./Modules/connectToMysql");

module.exports = function (app) {
  app.get("/api/getTimetable", authJWT, async function (req, res) {
    const userID = (await req?.userID) || null;
    const Grade = parseInt(String(userID)?.substring(0, 1)) || null;
    const Class = parseInt(String(userID)?.substring(1, 3)) || null;

    let getTable;

    getConnection_TT((connection) => {
      if (config.schoolInfo.onExam) {
        //시험 시간표
        getTable = `exam_schedule_${connection.escape(Grade)}`;
      } else {
        //학교 시간표
        getTable = `${connection.escape(Grade)}-${connection.escape(Class)}`;
      }

      connection.query(`SELECT * FROM \`${getTable}\``, (err, results, fields) => {
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
          data: results,
          onExam: config.schoolInfo.onExam,
        });
      });
    });
  });
};

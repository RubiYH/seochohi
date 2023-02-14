const e = require("express");
const { config } = require("../config");
const authJWT = require("../Middlewares/authJWT");
const { getConnection } = require("./Modules/connectToMysql");
const getTable = require("./Modules/getTable");

module.exports = function (app) {
  app.get("/api/handleviews", authJWT, async function (req, res) {
    const query = await req.query;

    let uid = parseInt(query?.uid) || null;
    let pid = parseInt(query?.pid) | null;
    let table = getTable(query?.table) || null;

    const userID = (await req?.userID) || null;
    const username = (await req?.username) || null;

    getConnection((connection) => {
      connection.query(
        `SELECT \`Views\` FROM ${connection.escape(
          table
        )} WHERE \`PostID\`=${connection.escape(
          pid
        )} AND \`UserID\`=${connection.escape(uid)}`,
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
            //의견 없음
            if (results.length < 1) {
              res.status(200).json({
                status: "error",
                message: "의견이 존재하지 않습니다.",
              });
              return;
            }

            // console.log(JSON.parse(results[0].Views)[1]);
            let ViewedList = JSON.parse(results[0].Views)[1];

            //이미 조회했을면
            if (
              ViewedList.some(
                (v) => v.userID === userID && v.username === username
              )
            ) {
              res.json({
                status: "alreadyVisited",
                message: "이미 조회한 의견입니다.",
              });
              return;
            } else {
              //조회한 유저 목록에 추가
              let newList = [
                JSON.parse(results[0].Views)[0] + 1,
                [
                  ...JSON.parse(results[0].Views)[1],
                  { userID: userID, username: username },
                ],
              ];

              connection.query(
                `UPDATE \`${connection.escape(
                  table
                )}\` SET \`Views\`=${connection.escape(
                  JSON.stringify(newList)
                )} WHERE \`PostID\`=${connection.escape(
                  pid
                )} AND \`UserID\`=${connection.escape(uid)}`,
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
                    res.status(200).json({
                      status: "success",
                    });
                  }
                }
              );
            }
          }
        }
      );
    });
  });
};

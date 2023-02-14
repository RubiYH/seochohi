const { config } = require("../config");
const authJWT = require("../Middlewares/authJWT");
const { getConnection } = require("./Modules/connectToMysql");
const getTable = require("./Modules/getTable");

module.exports = function (app) {
  app.get("/api/handlefavorites", authJWT, async function (req, res) {
    const query = await req.query;

    let uid = parseInt(query?.uid) || null;
    let pid = parseInt(query?.pid) | null;
    let table = getTable(query?.table) || null;

    const userID = (await req?.userID) || null;
    const username = (await req?.username) || null;

    var newFavorites;
    var isFavorite;

    const favorite = {
      table: table,
      PostID: pid,
      UserID: uid,
      favorite: true,
    };

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
          } else {
            const fullFavorite = JSON.parse(results[0].Favorites);
            const getFavorites = fullFavorite.filter(
              (f) => f.PostID === pid && f.UserID === uid && f.table === table
            );

            if (getFavorites[0]) {
              //좋아요 true 시
              if (getFavorites[0].favorite) {
                const index = fullFavorite.findIndex(
                  (f) =>
                    f.PostID === pid && f.UserID === uid && f.table === table
                );
                if (index >= 0) {
                  fullFavorite.splice(index, 1);
                }

                connection.query(
                  `UPDATE \`${table}\` SET \`Likes\`=\`Likes\` - 1 WHERE \`PostID\`=${connection.escape(
                    parseInt(pid)
                  )} and \`UserID\`=${connection.escape(uid)}`,
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
                      newFavorites = fullFavorite;
                      isFavorite = false;
                      final(newFavorites, isFavorite, "remove");
                    }
                  }
                );
              } else {
                //좋아요 없을 시
                connection.query(
                  `UPDATE \`${table}\` SET \`Likes\`=\`Likes\` + 1 WHERE \`PostID\`=${connection.escape(
                    parseInt(pid)
                  )} and \`UserID\`=${connection.escape(uid)}`,
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
                      newFavorites = [...fullFavorite, favorite];
                      isFavorite = true;
                      final(newFavorites, isFavorite, "add");
                    }
                  }
                );
              }
            } else {
              //배열 없을 시
              //좋아요 없을 시

              connection.query(
                `UPDATE \`${table}\` SET \`Likes\`=\`Likes\` + 1 WHERE \`PostID\`=${connection.escape(
                  parseInt(pid)
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
                    newFavorites = [...fullFavorite, favorite];
                    isFavorite = true;
                    final(newFavorites, isFavorite, "add");
                  }
                }
              );
            }

            //전송
            async function final(newFavorites, isFavorite, action) {
              connection.query(
                `UPDATE \`users\` SET \`Favorites\`=${connection.escape(
                  JSON.stringify(newFavorites)
                )} WHERE \`ID\`=${connection.escape(
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
                    connection.query(
                      `SELECT \`who_liked\` from \`${table}\` WHERE \`PostID\`=${connection.escape(
                        parseInt(pid)
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
                          let likeList = JSON.parse(results[0].who_liked);
                          let newlikeList;

                          if (action === "add") {
                            newlikeList = [
                              ...likeList,
                              {
                                userID: userID,
                                username: username,
                                table: table,
                              },
                            ];
                          } else if (action === "remove") {
                            const index = likeList.findIndex(
                              (f) =>
                                f.userID === userID &&
                                f.username === username &&
                                f.table === table
                            );

                            if (index >= 0) {
                              likeList.splice(index, 1);
                            }

                            newlikeList = likeList;
                          }

                          connection.query(
                            `UPDATE \`${table}\` SET \`who_liked\`=${connection.escape(
                              JSON.stringify(newlikeList)
                            )} WHERE \`PostID\`=${connection.escape(
                              pid
                            )} and \`UserID\`=${connection.escape(uid)}`,
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
                                  message: isFavorite
                                    ? "의견에 좋아요를 표시했습니다."
                                    : "의견에 좋아요를 해제했습니다.",
                                  favorite: isFavorite,
                                  action: action,
                                });
                              }
                            }
                          );
                        }
                      }
                    );
                  }
                }
              );
            }
          }
        }
      );
    });
  });

  //get favorites
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
          } else {
            res.status(200).json({
              status: "success",
              list: JSON.parse(results[0].Favorites).filter(
                (f) => f.table === table
              ),
            });
          }
        }
      );
    });
  });
};

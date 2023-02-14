const mysql = require("mysql2");
const config = require("../../config").config;

//seochohi DB
const pool_seochohi = mysql.createPool({
  host: config.mysql.host,
  user: config.mysql.user,
  password: config.mysql.password,
  database: "seochohi",
  charset: "utf8mb4",
});

function getConnection(callback) {
  pool_seochohi.getConnection((err, connection) => {
    if (err) return console.log(err);
    callback(connection);
    connection.release();
    // console.log(pool._allConnections.length); -> pool 접속자 수
  });
}

//Timetables DB
const pool_timetable = mysql.createPool({
  host: config.mysql.host,
  user: config.mysql.user,
  password: config.mysql.password,
  database: "timetables",
  charset: "utf8mb4",
});

function getConnection_TT(callback) {
  pool_timetable.getConnection((err, connection) => {
    if (err) return console.log(err);
    callback(connection);
    connection.release();
  });
}

//initial connection
getConnection((connection) => {
  console.log(`
  =======================================================
  (!) Connected to 'seochohi' database. ID ${connection.threadId}
  =======================================================
  `);
});

getConnection_TT((connection) => {
  console.log(`
  =======================================================
  (!) Connected to 'timetables' database. ID ${connection.threadId}
  =======================================================
  `);
});

module.exports = {
  mysql,
  getConnection,
  getConnection_TT,
  pool_seochohi,
  pool_timetable,
};

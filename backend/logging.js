function getCurDt() {
  let dt = new Date();

  let yy = dt.getFullYear();
  let mm = dt.getMonth() + 1; // january : 0
  let dd = dt.getDate();
  let hh = dt.getHours();
  let mi = dt.getMinutes();
  let ss = dt.getSeconds();

  mm = (mm < 10 ? "0" : "") + mm;
  dd = (dd < 10 ? "0" : "") + dd;
  hh = (hh < 10 ? "0" : "") + hh;
  mi = (mi < 10 ? "0" : "") + mi;
  ss = (ss < 10 ? "0" : "") + ss;

  let ymd = yy + "-" + mm + "-" + dd + " / " + hh + ":" + mi + ":" + ss;
  //console.log("ymd = " + ymd);
  return ymd;
}

console.log = function (d) {
  var sampleTimestamp = Date.now(); //현재시간 타임스탬프 13자리 예)1599891939914
  var date = new Date(sampleTimestamp); //타임스탬프를 인자로 받아 Date 객체 생성

  var year = date.getFullYear().toString(); //년도
  var month = ("0" + (date.getMonth() + 1)).slice(-2); //월 2자리 (01, 02 ... 12)
  var day = ("0" + date.getDate()).slice(-2); //일 2자리 (01, 02 ... 31)

  var logDate = year + "-" + month + "-" + day;

  var util = require("util");
  var log_stdout = process.stdout;

  log_stdout.write("[" + getCurDt() + "] " + util.format(d) + "\n");
};

module.exports = console.log;

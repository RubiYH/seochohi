const glob = require("glob");
const { config } = require("../config");
const authJWT = require("../Middlewares/authJWT");
const Subjects = require("../files/Subjects").Subjects;

module.exports = function (app) {
  app.get("/api/getexamfileslist/", authJWT, function (req, res) {
    let request = req.query;

    try {
      let grade = request.grade;
      let subject = JSON.parse(request.subject);
      let semester = JSON.parse(request.semester);
      let semesterValues = Object.values(semester);
      let semesterTypes = semesterValues.map((s) => s);

      glob("./files/exams/**/*.pdf", function (err, files) {
        let fileinfo = [];
        let filelist = [];

        files.forEach((f) => {
          let rawfilename = f.split("/")[4];
          let filedata = /\[(.+?)\]/.exec(rawfilename.replace(".pdf", "")); //꼬리 데이터

          //꼬리 데이터 파싱
          let rawfiledata = filedata[1].split("-");
          // [ '01', '02', 'm', '02', 'a', '2019' ]
          // [ '학년', '학기', '중간/기말', '과목', '문제/정답', '연도']

          function getSubject() {
            switch (Number(rawfiledata[0])) {
              case 1:
                return Subjects.first.find((s) => s.value === `${rawfiledata[3]}`).name;
              case 2:
                return Subjects.second.find((s) => s.value === `${rawfiledata[3]}`).name;
              case 3:
                return Subjects.third.find((s) => s.value === `${rawfiledata[3]}`).name;
              default:
                return "N/A";
            }
          }

          //문제지 필터링

          if (
            grade === rawfiledata[0] &&
            Object.values(semesterTypes).includes(rawfiledata[1] + "/" + rawfiledata[2]) &&
            Object.values(subject).includes(`${rawfiledata[3]}`)
          ) {
            fileinfo.push({
              rawfilename: rawfilename,
              name: rawfilename.replace(".pdf", "").replace(filedata[0], "").trim(),
              data: rawfiledata,
              year: rawfiledata[5],
              grade: Number(rawfiledata[0]),
              semester: Number(rawfiledata[1]),
              period: rawfiledata[2],
              subject: getSubject(),
              type: rawfiledata[4],
            });

            //중복 감지
            if (
              filelist.some(
                (f) =>
                  f.subject === getSubject() &&
                  f.year === rawfiledata[5] &&
                  f.grade === Number(rawfiledata[0]) &&
                  f.semester === Number(rawfiledata[1]) &&
                  f.period === rawfiledata[2]
              )
            )
              return;

            filelist.push({
              year: rawfiledata[5],
              grade: Number(rawfiledata[0]),
              semester: Number(rawfiledata[1]),
              period: rawfiledata[2],
              subject: getSubject(),
              subjectnumber: Number(rawfiledata[3]),
              name: rawfilename,
            });

            //분류
            filelist.sort((a, b) => {
              if (a.subjectnumber > b.subjectnumber) {
                return 1;
              }
              if (a.subjectnumber < b.subjectnumber) {
                return -1;
              }
              // a must be equal to b
              return 0;
            });
          }
        });

        if (fileinfo.length > 0) {
          res.json({
            status: "success",
            fileinfo: fileinfo,
            filelist: filelist,
          });
        } else {
          res.json({
            status: "empty",
          });
        }
      });
    } catch (err) {
      console.log("----------- Error -----------\nURL: " + req.url + "\nErr: " + err.toString());
      res.json({
        status: "error",
        message: "오류가 발생하였습니다.",
        fileinfo: [],
        filelist: [],
      });
    }
  });
};

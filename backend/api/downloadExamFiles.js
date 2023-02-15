const { config } = require("../config");
const authJWT = require("../Middlewares/authJWT");

module.exports = function (app) {
  app.get("/api/downloadexamfiles", authJWT, async function (req, res) {
    let request = req.query;

    try {
      let grade;
      switch (Number(JSON.parse(request.file).grade)) {
        case 1:
          grade = "first_grade";
          break;
        case 2:
          grade = "second_grade";
          break;
        case 3:
          grade = "third_grade";
          break;
      }

      let filename = JSON.parse(request.file).rawfilename;

      let path = `./files/exams/${grade}/${filename}`;
      let newname = JSON.parse(request.file).name;

      res.download(path, newname, function (err) {
        if (err) {
          res.sendStatus(500);
          console.log("---------- Error ----------\nErr: " + err.toString());
        }

        console.log(
          `\n-----\n${req?.userID} : 기출 문제를 다운로드하였습니다.\n- 파일: ${filename}\n-----`
        );
      });
    } catch (err) {
      console.log("----------- Error -----------\nURL: " + req.url + "\nErr: " + err.toString());
      res.json({
        status: "error",
      });
    }
  });
};

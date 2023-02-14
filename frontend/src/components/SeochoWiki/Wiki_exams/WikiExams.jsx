import * as React from "react";
import { useMediaQuery } from "react-responsive";
import { MediaQuery } from "../../Modules/MediaQuery";
import styles from "./WikiExams.module.css";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  AlertTitle,
  Button,
  Card,
  Checkbox,
  CircularProgress,
  Fade,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  IconButton,
  Radio,
  RadioGroup,
  Snackbar,
} from "@mui/material";
import { useState } from "react";

import MuiAlert from "@mui/material/Alert";

//icons
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

import { ExpandMore } from "@mui/icons-material";
import axios from "axios";
import { useEffect } from "react";
import settings from "../../../settings";
import { checkSession } from "../../Modules/Authorization/checkSession";
import { switchSessionResult } from "../../Modules/Authorization/sessionSwitches";
import Navbar from "../../Modules/Navbar/Navbar";
const domain = settings.api.domain;

//과목 목록
// import { Subjects } from "../../../../../../seochohi_server/files/Subjects";
let Subjects;

// import * as _ from "lodash";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function WikiExams(props) {
  //error snackbar
  const [isApiError, handleApiError] = useState({
    error: false,
    status: false,
    msg: null,
    submsg: null,
  });

  //download success snackbar
  const [isSuccess, handleDownload] = useState({ status: false, msg: null });

  //JWT 인증
  const [isAuth, setAuth] = useState(false);
  const [userData, setUserData] = useState({
    status: null,
    userID: null,
    username: null,
  });

  useEffect(() => {
    checkSession({ ignore: props?.NeedAuth }).then((c) => {
      setAuth(c.isAuth);
      setUserData(c.userData);

      if (!c.isAuth) {
        switchSessionResult(c.userData.status);
      }
    });
  }, []);

  useEffect(() => {
    if (!isAuth) return;

    axios
      .get(`${domain}/api/getsubjects`)
      .then((res) => {
        Subjects = res.data.data;
        // console.log(Subjects);
      })
      .catch((err) => {
        handleApiError({
          error: true,
          status: true,
          msg: "데이터 수신 중 오류가 발생하였습니다.",
          submsg: "나중에 다시 시도하세요.",
        });
        console.log(err);
      });
  }, [isAuth]);

  //responsive : PC
  const isDesktopOrLaptop = useMediaQuery({
    query: MediaQuery("PC"),
  });

  //responsive: Mobile
  const isMobile = useMediaQuery({
    query: MediaQuery("Mobile"),
  });

  //responsive: Tiny Mobile
  const isTinyMobile = useMediaQuery({
    query: MediaQuery("Tiny"),
  });

  //학년 선택 저장
  const [grade, setGrade] = useState({
    first: false,
    second: false,
    third: false,
  });

  const { first, second, third } = grade;

  const handleGradeChange = (e) => {
    if (!grade[e.target.value]) {
      setSubject({});
      setSubjectCount(0);
      setSemester({});
      setSemesterCount(0);
    }
    setGrade({
      first: false,
      second: false,
      third: false,
      [e.target.value]: e.target.checked,
    });
  };

  const GradeIsChecked = Object.values(grade).some((k) => k === true);

  const canLoadSubjects =
    GradeIsChecked === true && isApiError.error === true ? false : true;

  //과목 선택 저장
  const [subject, setSubject] = useState({});
  const [subjectCount, setSubjectCount] = useState(0);

  function checkSemester() {
    setSubjectCount(subjectCount - 1);
    if (subjectCount === 1) {
      setSemesterCount(0);
    }
  }

  const SubjectsOnChange = (e) => {
    e.target.checked
      ? setSubject({ ...subject, [e.target.name]: e.target.value })
      : deleteSubject(e);

    e.target.checked ? setSubjectCount(subjectCount + 1) : checkSemester();
  };

  const deleteSubject = (e) => {
    delete subject[e.target.name];
    setSubject(subject);
  };

  const SubjectIsChecked = subjectCount > 0;

  //학기 선택 저장
  const [semester, setSemester] = useState({});
  const [semesterCount, setSemesterCount] = useState(0);

  const SemesterOnChange = (e) => {
    e.target.checked
      ? setSemester({ ...semester, [e.target.name]: e.target.value })
      : deleteSemester(e);

    e.target.checked
      ? setSemesterCount(semesterCount + 1)
      : setSemesterCount(semesterCount - 1);
  };

  const deleteSemester = (e) => {
    delete semester[e.target.name];
    setSemester(semester);
  };

  const SemesterIsChecked = semesterCount > 0;

  //기출 검색 함수
  const [DownloadList, setDownloadList] = useState(null);

  //loading
  const [onLoad, setOnLoad] = useState(false);

  const searchExams = (grade, subject, semester) => {
    // console.log(grade, subject, semester);

    let gradeN = Object.keys(grade).find((key) => grade[key] === true);

    let gradenumber;
    if (gradeN === "first") {
      gradenumber = "01";
    } else if (gradeN === "second") {
      gradenumber = "02";
    } else if (gradeN === "third") {
      gradenumber = "03";
    } else {
      gradenumber = "all";
    }

    //start loading
    setOnLoad(true);
    setDownloadList({ filelist: [] });

    //axios
    axios
      .get(`${domain}/api/getexamfileslist`, {
        params: { grade: gradenumber, subject: subject, semester: semester },
        withCredentials: true,
      })
      .then((res) => {
        switch (res.status) {
          case 200:
            switch (res.data.status) {
              case "success":
                setOnLoad(false);
                setDownloadList(res.data);
                // console.log(res.data);
                break;
              case "unauthorized":
                setDownloadList({ filelist: [] });
                alert(res.data.message);
                window.location.replace("/login");
                return;
              case "invalid":
                setDownloadList({ filelist: [] });
                window.location.replace("/login");
                return;
              case "empty":
                setOnLoad(false);
                setDownloadList({ status: "empty", filelist: [] });
                break;
              default:
                setOnLoad(false);
                setDownloadList({ filelist: [] });
                // console.log(res.data.status);
                break;
            }
            break;
          default:
            handleApiError({
              error: true,
              status: true,
              msg: `목록을 불러오지 못했습니다. (${res.status})`,
              submsg: "나중에 다시 시도하세요.",
            });
            break;
        }
      })
      .catch((err) => {
        handleApiError({
          error: true,
          status: true,
          msg: `목록을 불러오지 못했습니다. (${err.message})`,
          submsg: "나중에 다시 시도하세요.",
        });
        console.log(err);
      });
  };

  //m, f => 중간, 기말
  let getPeriod = new Map();
  getPeriod.set("m", "중간");
  getPeriod.set("f", "기말");

  //a, p, ap => 정답, 문제, 문제 및 정답

  let getExamType = new Map();
  getExamType.set("a", "정답");
  getExamType.set("p", "문제");
  getExamType.set("ap", "문제 및 정답");

  //기출 다운로드
  function downloadExamFiles(d, type) {
    // console.log(DownloadList.fileinfo);

    let fileredFileInfo = DownloadList.fileinfo.filter(
      (f) =>
        f.grade === d.grade &&
        f.period === d.period &&
        f.semester === d.semester &&
        f.year === d.year &&
        f.subject === d.subject &&
        f.type === type
    );

    // console.log(fileredFileInfo);

    for (var i = 0; i < fileredFileInfo.length; i++) {
      let name = fileredFileInfo[i].name;
      axios
        .get(`${domain}/api/downloadexamfiles`, {
          params: {
            file: fileredFileInfo[i],
          },
          responseType: "blob",
          withCredentials: true,
        })
        .then((res) => {
          switch (res.data.status) {
            case 500:
              handleApiError({
                error: true,
                status: true,
                msg: "다운로드 도중에 오류가 발생하였습니다.",
                submsg: "500 Internal Server Error",
              });
              return;
            case "unauthorized":
              alert(res.data.message);
              window.location.replace("/login");
              return;
            case "invalid":
              window.location.replace("/login");
              return;
            default:
              break;
          }

          let newname = name;

          //Android webView Downloader
          if (window.Android) {
            var reader = new FileReader();
            reader.readAsDataURL(new Blob([res.data]));
            reader.onloadend = function () {
              window.Android.getBase64FromBlobData(reader.result, newname);
            };
            return;
          }

          //Browser Downloader
          const url = window.URL.createObjectURL(new Blob([res.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", newname + ".pdf");
          document.body.appendChild(link);
          link.click();
          window.URL.revokeObjectURL(url);
          link.remove();

          handleDownload({ status: true, msg: "다운로드가 완료되었습니다." });
        })
        .catch((err) => {
          handleApiError({
            status: true,
            msg: `다운로드 도중에 오류가 발생하였습니다. (${err.message})`,
            submsg: "나중에 다시 시도하세요.",
          });
          console.log(err);
        });
    }
  }

  //문제지 & 정답지
  function has(d, type) {
    let fl = DownloadList.fileinfo.some(
      (f) =>
        f.grade === d.grade &&
        f.period === d.period &&
        f.semester === d.semester &&
        f.year === d.year &&
        f.subject === d.subject &&
        f.type === type
    );

    if (fl) return true;
    return false;
  }

  return (
    <>
      {isAuth && (
        <>
          <Navbar type="menu" name={props?.name} />
          <div
            className="wrapper"
            style={{ display: isDesktopOrLaptop ? "inline-block" : "block" }}
          >
            <div
              className="content"
              style={{ flexDirection: "column", alignItems: "center" }}
            >
              <div className={styles.frame}>
                <Card className={styles.section_select}>
                  <div className={styles.selectGrade}>
                    <h4 className={styles.h4} style={{ padding: "0" }}>
                      필터
                    </h4>
                    <FormControl>
                      <FormLabel>학년</FormLabel>
                      {/* 학년 */}
                      <RadioGroup name="radio-select-grade" row>
                        <FormControlLabel
                          value="first"
                          control={<Radio onChange={handleGradeChange} />}
                          label="1학년"
                        />
                        <FormControlLabel
                          value="second"
                          control={<Radio onChange={handleGradeChange} />}
                          label="2학년"
                        />
                        <FormControlLabel
                          value="third"
                          control={<Radio onChange={handleGradeChange} />}
                          label="3학년"
                        />
                      </RadioGroup>
                    </FormControl>
                  </div>
                  <div className={styles.selectSubject}>
                    <FormControl>
                      <FormLabel>과목</FormLabel>
                      {/* 과목 */}
                      {!GradeIsChecked && (
                        <span style={{ color: "#777" }}>
                          학년을 선택하세요.
                        </span>
                      )}
                      {/* 과목 불러오기 오류 */}
                      {!canLoadSubjects && (
                        <span style={{ color: "#d32f2f" }}>
                          과목을 불러올 수 없습니다. 나중에 다시 시도하세요.
                        </span>
                      )}
                      {/* 1학년 과목 */}
                      {first && (
                        <FormGroup row>
                          {Subjects?.first.map((s) => (
                            <FormControlLabel
                              control={<Checkbox />}
                              label={s.name}
                              name={s.name}
                              value={s.value}
                              key={s.value}
                              onChange={SubjectsOnChange}
                            />
                          ))}
                        </FormGroup>
                      )}
                      {/* 2학년 과목 */}
                      {second && (
                        <FormGroup row>
                          {Subjects?.second.map((s) => (
                            <FormControlLabel
                              control={<Checkbox />}
                              label={s.name}
                              name={s.name}
                              value={s.value}
                              key={s.value}
                              onChange={SubjectsOnChange}
                            />
                          ))}
                        </FormGroup>
                      )}
                      {third && (
                        <FormGroup row>
                          {Subjects?.third.map((s) => (
                            <FormControlLabel
                              control={<Checkbox />}
                              label={s.name}
                              name={s.name}
                              value={s.value}
                              key={s.value}
                              onChange={SubjectsOnChange}
                            />
                          ))}
                        </FormGroup>
                      )}
                    </FormControl>
                  </div>
                  <div className={styles.selectSemester}>
                    <FormControl>
                      <FormLabel>학기</FormLabel>
                      {/* 학기 */}
                      {SubjectIsChecked ? (
                        <FormGroup row>
                          <FormControlLabel
                            control={<Checkbox />}
                            label="1학기 중간고사"
                            name="1_midterm"
                            value="01/m"
                            onChange={SemesterOnChange}
                          />
                          <FormControlLabel
                            control={<Checkbox />}
                            label="1학기 기말고사"
                            name="1_final"
                            value="01/f"
                            onChange={SemesterOnChange}
                          />
                          <FormControlLabel
                            control={<Checkbox />}
                            label="2학기 중간고사"
                            name="2_midterm"
                            value="02/m"
                            onChange={SemesterOnChange}
                          />
                          <FormControlLabel
                            control={<Checkbox />}
                            label="2학기 기말고사"
                            name="2_final"
                            value="02/f"
                            onChange={SemesterOnChange}
                          />
                        </FormGroup>
                      ) : (
                        <span style={{ color: "#777" }}>과목을 선택하세요</span>
                      )}
                    </FormControl>
                  </div>
                  <div className={styles["btn-search"]}>
                    <Button
                      variant="outlined"
                      onClick={() => searchExams(grade, subject, semester)}
                      disabled={!SemesterIsChecked}
                    >
                      찾기
                    </Button>
                  </div>
                </Card>
                <br />
                <Card className={styles.DownloadFrame}>
                  <h4 className={styles.h4} style={{ marginBottom: 0 }}>
                    다운로드 목록
                  </h4>
                  {DownloadList && (
                    <table className={styles.DownloadTable}>
                      {!isTinyMobile && (
                        <>
                          <thead>
                            <tr className={styles.DTheader}>
                              <td style={{ width: "10%" }}>연도</td>
                              <td style={{ width: "10%" }}>학년</td>
                              <td style={{ width: "10%" }}>학기</td>
                              <td style={{ width: "10%" }}>종류</td>
                              <td
                                style={
                                  isMobile
                                    ? { width: "2rem" }
                                    : { width: "10%" }
                                }
                              >
                                과목
                              </td>
                              {!isTinyMobile && (
                                <td style={{ width: "20%" }} colSpan="2">
                                  다운로드
                                </td>
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {onLoad === true && (
                              <tr>
                                <td colSpan="7" rowSpan="2">
                                  <Fade in={true}>
                                    <CircularProgress disableShrink />
                                  </Fade>
                                </td>
                              </tr>
                            )}
                            {DownloadList?.status === "empty" ? (
                              <tr>
                                <td
                                  colSpan="7"
                                  style={{
                                    padding: "1rem",
                                    lineHeight: "4rem",
                                  }}
                                >
                                  항목이 없습니다.
                                </td>
                              </tr>
                            ) : (
                              DownloadList?.filelist.map((d) => (
                                <tr key={d.name} className={styles.dlTR}>
                                  <td>
                                    {d.year}
                                    {isDesktopOrLaptop ? "년" : ""}
                                  </td>
                                  <td>
                                    {d.grade}
                                    {isDesktopOrLaptop ? "학년" : ""}
                                  </td>
                                  <td>
                                    {d.semester}
                                    {isDesktopOrLaptop ? "학기" : ""}
                                  </td>
                                  <td>
                                    {d.period === "m"
                                      ? isDesktopOrLaptop
                                        ? "중간고사"
                                        : "중간"
                                      : d.period === "f"
                                      ? isDesktopOrLaptop
                                        ? "기말고사"
                                        : "기말"
                                      : "N/A"}
                                  </td>
                                  <td className={styles.dlSubject}>
                                    {d.subject}
                                  </td>

                                  {has(d, "p") && (
                                    <td className={styles.dlTab}>
                                      <div>
                                        <span>문제</span>
                                        <IconButton
                                          onClick={() =>
                                            downloadExamFiles(d, "p")
                                          }
                                        >
                                          <PictureAsPdfIcon
                                            className={styles.dlPDF}
                                          />
                                        </IconButton>
                                      </div>
                                    </td>
                                  )}

                                  {has(d, "a") && (
                                    <td className={styles.dlTab}>
                                      <div>
                                        <span>정답</span>
                                        <IconButton
                                          onClick={() =>
                                            downloadExamFiles(d, "a")
                                          }
                                        >
                                          <PictureAsPdfIcon
                                            className={styles.dlPDF}
                                          />
                                        </IconButton>
                                      </div>
                                    </td>
                                  )}

                                  {has(d, "ap") && (
                                    <td colSpan="2" className={styles.dlTab}>
                                      <div>
                                        <span style={{ fontSize: "0.7rem" }}>
                                          문제 및 정답
                                        </span>
                                        <IconButton
                                          onClick={() =>
                                            downloadExamFiles(d, "ap")
                                          }
                                        >
                                          <PictureAsPdfIcon
                                            className={styles.dlPDF}
                                          />
                                        </IconButton>
                                      </div>
                                    </td>
                                  )}
                                </tr>
                              ))
                            )}
                          </tbody>
                        </>
                      )}

                      {isTinyMobile && (
                        <tbody>
                          {onLoad === true && (
                            <tr>
                              <td colSpan="6" rowSpan="2">
                                <Fade in={true}>
                                  <CircularProgress disableShrink />
                                </Fade>
                              </td>
                            </tr>
                          )}
                          {DownloadList?.status === "empty" ? (
                            <tr>
                              <td
                                colSpan="6"
                                style={{ padding: "1rem", lineHeight: "4rem" }}
                              >
                                항목이 없습니다.
                              </td>
                            </tr>
                          ) : (
                            <tr>
                              <td colSpan="6" style={{ padding: 0 }}>
                                <div>
                                  {DownloadList?.filelist.map((d) => (
                                    <Accordion
                                      key={d.name}
                                      sx={{
                                        width: "100%",
                                        whiteSpace: "pre-line",
                                        justifyContent: "center",
                                      }}
                                    >
                                      <AccordionSummary
                                        expandIcon={<ExpandMore />}
                                      >
                                        {`${d.year}년 ${d.grade}학년 ${
                                          d.semester
                                        }학기 ${
                                          d.period === "m"
                                            ? "중간고사"
                                            : d.period === "f"
                                            ? "기말고사"
                                            : "N/A"
                                        }\n${d.subject}`}
                                      </AccordionSummary>
                                      <AccordionDetails>
                                        <table className={styles.DLTable}>
                                          <tbody>
                                            <tr>
                                              {has(d, "p") && (
                                                <td className={styles.dlTab}>
                                                  <div>
                                                    <span>문제</span>
                                                    <IconButton
                                                      onClick={() =>
                                                        downloadExamFiles(
                                                          d,
                                                          "p"
                                                        )
                                                      }
                                                    >
                                                      <PictureAsPdfIcon
                                                        className={styles.dlPDF}
                                                      />
                                                    </IconButton>
                                                  </div>
                                                </td>
                                              )}

                                              {has(d, "a") && (
                                                <td className={styles.dlTab}>
                                                  <div>
                                                    <span>정답</span>
                                                    <IconButton
                                                      onClick={() =>
                                                        downloadExamFiles(
                                                          d,
                                                          "a"
                                                        )
                                                      }
                                                    >
                                                      <PictureAsPdfIcon
                                                        className={styles.dlPDF}
                                                      />
                                                    </IconButton>
                                                  </div>
                                                </td>
                                              )}

                                              {has(d, "ap") && (
                                                <td
                                                  colSpan="2"
                                                  className={styles.dlTab}
                                                >
                                                  <div>
                                                    <span
                                                      style={{
                                                        fontSize: "0.7rem",
                                                      }}
                                                    >
                                                      문제 및 정답
                                                    </span>
                                                    <IconButton
                                                      onClick={() =>
                                                        downloadExamFiles(
                                                          d,
                                                          "ap"
                                                        )
                                                      }
                                                    >
                                                      <PictureAsPdfIcon
                                                        className={styles.dlPDF}
                                                      />
                                                    </IconButton>
                                                  </div>
                                                </td>
                                              )}
                                            </tr>
                                          </tbody>
                                        </table>
                                      </AccordionDetails>
                                    </Accordion>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      )}
                    </table>
                  )}
                </Card>
              </div>
            </div>
          </div>
          <Snackbar
            open={isApiError.status}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            onClose={() => {
              handleApiError({
                error: isApiError.error,
                status: false,
                msg: isApiError.msg,
                submsg: isApiError.submsg,
              });
            }}
          >
            <Alert severity="error">
              <AlertTitle>{isApiError.msg}</AlertTitle>
              {isApiError.submsg}
            </Alert>
          </Snackbar>
          <Snackbar
            open={isSuccess.status}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            onClose={() => {
              handleDownload({ status: false, msg: isSuccess.msg });
            }}
          >
            <Alert severity="success">{isSuccess.msg}</Alert>
          </Snackbar>
        </>
      )}
    </>
  );
}

import {
  Box,
  Button,
  Card,
  CardActionArea,
  Fade,
  Grid,
  IconButton,
  Modal,
  Paper,
} from "@mui/material";
import axios from "axios";
import { Link } from "react-router-dom";
import settings from "../../settings";
import events from "../SeochoWiki/Wiki_schedule/events";
import styles from "./Home.module.css";

import { useMediaQuery } from "react-responsive";
import { MediaQuery } from "../Modules/MediaQuery";

import { Settings } from "@mui/icons-material";
import { useEffect, useState } from "react";
import GoodBye from "../GoodBye/GoodBye";
import BottomPopup from "../Modules/BottomPopup/BottomPopup";
import { elapsedTime } from "../Modules/elapsedTime";
import MainBanner from "../Modules/MainBanner/MainBanner";
import Navbar from "../Modules/Navbar/Navbar";
import Notice from "../Modules/Notice/Notice";
import TimeTable from "../MyClass/MyClass_timetable/TimeTable";
import { Tags } from "../SeochoForest/Forest/Tags";

export default function Home(props) {
  const { isAuth, userData } = props.data;

  const [getAvatar, setAvatar] = useState(null);

  useEffect(() => {
    if (userData?.gender === "m") {
      setAvatar("https://cdn-icons-png.flaticon.com/512/257/257634.png");
    } else if (userData?.gender === "f") {
      setAvatar("https://cdn-icons-png.flaticon.com/512/257/257651.png");
    }
  }, [userData]);

  //responsive : Mobile
  const isTabletOrMobile = useMediaQuery({
    query: MediaQuery("Mobile"),
  });

  //responsive : PC

  function getDate(date) {
    var year = date.getFullYear();
    var month = ("0" + (date.getMonth() + 1)).slice(-2);
    var day = ("0" + date.getDate()).slice(-2);
    var dateArray = [year, month, day];

    return dateArray;
  }

  const [date, setDate] = useState(getDate(new Date()));
  const [lunch, setLunch] = useState({ lunch: null, msg: null, state: null });

  //오늘 급식 로드
  useEffect(() => {
    getTodayLunchInfo(date);
  }, [date]);

  const [LoadedLunch, setLoadedLunch] = useState(false);

  async function getTodayLunchInfo() {
    let LunchAPIurl = `https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=ed339baf4e7d44ff86f7ac3ec4ed9c33&Type=json&pIndex=1&ATPT_OFCDC_SC_CODE=B10&SD_SCHUL_CODE=7010087&MLSV_YMD=${date.join(
      ""
    )}`;

    setLoadedLunch(true);

    axios
      .get(LunchAPIurl)
      .then((json) => {
        setLoadedLunch(false);

        let ReceivedLunchInfo;

        if (json.data.mealServiceDietInfo) {
          switch (json.data.mealServiceDietInfo[0].head[1].RESULT.CODE) {
            default:
              ReceivedLunchInfo = "오류가 발생하였습니다.";
              setLunch({ msg: ReceivedLunchInfo, state: "error" });
              break;

            case "INFO-000":
              let obj = json.data.mealServiceDietInfo[1].row[0];
              ReceivedLunchInfo = obj.DDISH_NM.replace(/<br\s*[/]?>/gi, ",")
                .trim()
                .split(",");

              //성공
              setLunch({
                lunch: JSON.stringify(ReceivedLunchInfo),
                state: "success",
              });
              break;
          }
        } else if (json.data.RESULT) {
          switch (json.data.RESULT.CODE) {
            default:
              ReceivedLunchInfo = "급식 정보를 불러오지 못하였습니다.";
              setLunch({ msg: ReceivedLunchInfo, state: "failed" });
              break;
            case "INFO-200":
              ReceivedLunchInfo = json.data.RESULT.MESSAGE;
              setLunch({ msg: ReceivedLunchInfo, state: "200" });
              break;
          }
        } else {
          ReceivedLunchInfo = "API 오류";
          setLunch({ msg: ReceivedLunchInfo, state: "api-error" });
        }
      })
      .catch((err) => {
        setLunch({
          msg: `급식 정보를 불러오지 못하였습니다: ${err.message}`,
          state: "failed",
        });
        console.log(err);
      });
  }

  let LunchInfo;
  if (lunch.state === "null") {
    LunchInfo = "데이터 없음";
  } else if (lunch.state === "200") {
    LunchInfo = lunch.msg;
  } else if (lunch.state === "success") {
    LunchInfo = Object.values(JSON.parse(lunch.lunch)).map((l) => (
      <p key={l}>{l}</p>
    ));
  } else {
    LunchInfo = lunch.msg;
  }

  //오늘 학사일정
  const GetTodaySchedule = () => {
    let d = date.join("-");
    let todayEvents = events.filter((e) => e.start === d);
    return todayEvents;
  };

  const TodaySchedule = isAuth ? (
    GetTodaySchedule().length > 0 ? (
      GetTodaySchedule().map((m) => <p key={m.title}>{m.title}</p>)
    ) : (
      <p>오늘은 일정이 없습니다.</p>
    )
  ) : (
    <p>로그인이 필요합니다.</p>
  );

  //오늘의 시간표
  const [timetable, setTimetable] = useState(null);
  const [onExam, setExamStatus] = useState(false);

  useEffect(() => {
    if (!isAuth) return;
    axios
      .get(`${settings.api.domain}/api/getTimetable`, {
        withCredentials: true,
      })
      .then((res) => {
        switch (res.data.status) {
          case "success":
            setTimetable(res.data.data);
            setExamStatus(res.data.onExam);
            break;
          case "unauthorized":
            setTimetable(null);
            return;
          case "invalid":
            setTimetable(null);
            return;
          default:
            alert("오류가 발생하였습니다. " + res.data.message);
            break;
        }
      });
  }, [isAuth]);

  //서초고숲
  const [ForestData, setFD] = useState([]);

  const [isLoggedIn, setIL] = useState(false);

  useEffect(() => {
    if (!isAuth) return;

    setIL(true);
    axios
      .get(`${settings.api.domain}/api/getTableList`, {
        params: {
          table: "all",
          c: 8,
          lastPosition: -8,
          orderBy: "latest",
          query: null,
        },
        withCredentials: true,
      })
      .then((res) => {
        switch (res.data.status) {
          case "success":
            if (res.data?.data.length < 1) {
              setFD([]);
            } else {
              setFD(res.data?.data);
            }
            break;

          case "unauthorized":
            setFD("로그인이 필요합니다.");
            break;

          case "invalid":
            setFD("세션이 유효하지 않습니다.");
            break;
          default:
            break;
        }
      });
  }, [isAuth]);

  //서초타임
  const [TimeData, setTD] = useState(null);

  useEffect(() => {
    if (!settings.server.Banner) return;

    axios.get(`${settings.api.domain}/api/getEventInfo`).then((res) => {
      switch (res.data.status) {
        case "success":
          setTD(res.data?.data);
          break;
        default:
          setTD(null);
          break;
      }
    });
  }, []);

  //카드 순서 변경

  //modal
  const [open, setOpen] = useState(true);

  return (
    <>
      <Navbar type="menu" name="홈" />
      <div className="wrapper" style={{ padding: 0 }}>
        <div className="content">
          <Notice isAuth={isAuth} />
          <BottomPopup />
          <Grid
            className={styles.homegrid}
            container
            rowSpacing={2}
            spacing={2}
            alignItems="center"
            justifyContent="center"
            sx={{
              top: 0,
              left: 0,
              marginTop: 0,
              paddingTop: 0,
              transition: "margin-top 600ms",
            }}
          >
            <MainBanner isAuth={isAuth} />

            <>
              <Grid
                item
                xs={isTabletOrMobile ? 12 : 6}
                sx={{
                  paddingTop: "0 !important",
                }}
              >
                <Card
                  className={styles.header}
                  style={{
                    justifyContent: isAuth ? "" : "center",
                  }}
                >
                  <div className={styles.avatarInfo}>
                    <div
                      className={styles.avatar}
                      style={{ width: isAuth ? "" : 0 }}
                    >
                      <img src={getAvatar} alt="" />
                    </div>
                    <div className={styles.userInfo}>
                      <span>
                        {userData?.userID
                          ? `${String(userData?.userID).slice(
                              0,
                              1
                            )}학년 ${parseInt(
                              String(userData?.userID).slice(1, 3)
                            )}반`
                          : ""}
                      </span>
                      <span>{userData?.username || ""}</span>
                      <div className={styles.linkTextRow}>
                        <Link to="/myclass" className={styles.linkText}>
                          내 학급
                        </Link>
                        {/* <Link
                          to="/myclass/quicknotes"
                          className={styles.linkText}
                        >
                          메모
                        </Link> */}
                      </div>
                    </div>
                  </div>
                  <div className={styles.headerTools}>
                    <Link to="/settings">
                      <IconButton>
                        <Settings fontSize="small" />
                      </IconButton>
                    </Link>
                    {/* <IconButton onClick={() => changeCard()}>
                      <AppRegistration fontSize="small" />
                    </IconButton> */}
                  </div>
                </Card>
              </Grid>
            </>

            {/* <HomeMenu /> */}

            <>
              <Grid
                item
                xs={isTabletOrMobile ? 12 : 6}
                sx={{ paddingTop: "0 !important" }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    border: onExam ? "2px solid var(--highlight-exam)" : null,
                  }}
                  className={styles["box-container"]}
                >
                  <Paper elevation={0} className={styles.gridTitle}>
                    <div
                      className={styles.gridTitleText}
                      style={{
                        color: onExam ? "var(--highlight-exam)" : null,
                      }}
                    >
                      {onExam ? "시험 시간표" : "나의 시간표"}
                    </div>
                  </Paper>
                  <Card className={styles.gridContent}>
                    {/* 나의 시간표 */}
                    {timetable && (
                      <TimeTable data={timetable} tooltip={false} />
                    )}
                  </Card>
                </Paper>
              </Grid>
            </>

            <Grid
              item
              xs={isTabletOrMobile ? 12 : 6}
              sx={{ paddingTop: "0 !important" }}
            >
              <Paper elevation={0} className={styles["box-container"]}>
                <Paper elevation={0} className={styles.gridTitle}>
                  <div className={styles.gridTitleText}>
                    오늘의 급식
                    <div>
                      <Link
                        to="/wiki/lunch"
                        className={`${styles.linkText} ${styles.rT}`}
                      >
                        더보기
                      </Link>
                    </div>
                  </div>
                </Paper>
                <Card className={`${styles.gridContent} ${styles.lunchInfo}`}>
                  {/* 급식 */}
                  <div
                    className={styles.lunchDate}
                    style={{
                      background:
                        localStorage.getItem("theme") === "dark"
                          ? "rgba(255, 255, 255, 0.12)"
                          : "#fff",
                    }}
                  >
                    <span>오늘</span>
                  </div>
                  <div className={styles.lunchInfoContent}>
                    {LoadedLunch && <p>급식 정보를 불러오는 중입니다...</p>}
                    {!LoadedLunch && <>{LunchInfo}</>}
                  </div>
                </Card>
              </Paper>
            </Grid>

            <Grid
              item
              xs={isTabletOrMobile ? 12 : 6}
              sx={{ paddingTop: "0 !important" }}
            >
              <Paper elevation={0} className={styles["box-container"]}>
                <Paper elevation={0} className={styles.gridTitle}>
                  <div className={styles.gridTitleText}>
                    학사일정
                    <div>
                      <Link
                        to="/wiki/schedule"
                        className={`${styles.linkText} ${styles.rT}`}
                      >
                        더보기
                      </Link>
                    </div>
                  </div>
                </Paper>
                <Card className={styles.gridContent}>
                  {/* 학사일정 */}
                  <h2 style={{ marginTop: 0 }}>
                    {date[1]}월 {date[2]}일
                  </h2>
                  <div className={styles.scheduleInfo}>{TodaySchedule}</div>
                </Card>
              </Paper>
            </Grid>
            <Grid
              item
              xs={isTabletOrMobile ? 12 : 6}
              sx={{ paddingTop: "0 !important" }}
            >
              <Paper elevation={0} className={styles["box-container"]}>
                <Paper elevation={0} className={styles.gridTitle}>
                  <div className={styles.gridTitleText}>
                    서초고숲
                    <div>
                      <Link
                        to="/forest"
                        className={`${styles.linkText} ${styles.rT}`}
                      >
                        더보기
                      </Link>
                    </div>
                  </div>
                </Paper>
                <Card
                  className={styles.gridContent}
                  style={{
                    justifyContent:
                      ForestData?.length > 0 ? "flex-start" : null,
                  }}
                >
                  {/* 서초고숲 */}
                  {ForestData && ForestData?.length > 0
                    ? ForestData.map((f, i) => (
                        <CardActionArea component="div" key={i}>
                          <Link
                            to={`/forest/${f?.Tags}/${f?.UserID}/${f?.PostID}`}
                            className={styles.ForestWrapper}
                          >
                            <div className={styles.ForestContent}>
                              <span>
                                [{Tags.get(f?.Tags)}] {f?.Username}
                              </span>
                              <span className={styles.ForestTitle}>
                                {f?.Content}
                              </span>
                            </div>
                            <span className={styles.ForestTime}>
                              {elapsedTime(f?.Date)}
                            </span>
                          </Link>
                        </CardActionArea>
                      ))
                    : !isLoggedIn
                    ? "로그인이 필요합니다."
                    : "아직 의견이 없습니다."}
                </Card>
              </Paper>
            </Grid>
            <Grid
              item
              xs={isTabletOrMobile ? 12 : 6}
              sx={{ paddingTop: "0 !important" }}
            >
              <Paper elevation={0} className={styles["box-container"]}>
                <Paper elevation={0} className={styles.gridTitle}>
                  <div className={styles.gridTitleText}>
                    서초타임
                    <div>
                      <Link
                        to="/time/event/notes"
                        className={`${styles.linkText} ${styles.rT}`}
                      >
                        더보기
                      </Link>
                    </div>
                  </div>
                </Paper>
                <Card
                  className={styles.gridContent}
                  style={{ justifyContent: TimeData ? "flex-start" : null }}
                >
                  {/* 서초타임 */}
                  {TimeData && TimeData.length > 0 ? (
                    <CardActionArea component="div">
                      <Link
                        to={TimeData?.url}
                        style={{ textDecoration: "none", color: "initial" }}
                        className={styles.TimeContent}
                      >
                        <div>
                          <span>
                            [{TimeData?.period}] {TimeData?.title}
                          </span>
                        </div>
                      </Link>
                    </CardActionArea>
                  ) : (
                    <span>현재 이벤트가 없습니다.</span>
                  )}
                </Card>
              </Paper>
            </Grid>
          </Grid>
        </div>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} closeAfterTransition>
        <Fade in={open}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "75%",
              minWidth: "12rem",
              bgcolor: "background.paper",
              textAlign: "center",
              boxShadow: 24,
              borderRadius: "var(--modal-radius)",
              p: 2,
            }}
          >
            <GoodBye />
            <br />
            <Button variant="contained" onClick={() => setOpen(false)}>
              닫기
            </Button>
          </Box>
        </Fade>
      </Modal>
    </>
  );
}

import axios from "axios";
import { addDays, format, subDays } from "date-fns";
import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { MediaQuery } from "../../Modules/MediaQuery";
import Navbar from "../../Modules/Navbar/Navbar";
import styles from "./WikiLunch.module.css";

//icons
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Button, Card, Fade, IconButton, Modal, Stack, Typography } from "@mui/material";

export default function WikiLunch(props) {
  function getDate(date) {
    var year = date.getFullYear();
    var month = ("0" + (date.getMonth() + 1)).slice(-2);
    var day = ("0" + date.getDate()).slice(-2);
    var dateArray = [year, month, day];

    return dateArray;
  }

  //급식 정보 저장,
  const [lunch, setLunch] = useState({ lunch: null, msg: null, state: null });
  //급식 불러오는 중
  const [LoadedLunch, setLoadedLunch] = useState(false);
  //날짜 저장
  const [date, setDate] = useState(getDate(new Date()));
  let rawdate = new Date(date.join(","));
  let week = ["일", "월", "화", "수", "목", "금", "토"];

  //오늘 급식 로드
  useEffect(() => {
    getLunchInfo(date);
  }, [date]);

  async function getLunchInfo(date) {
    let LunchAPIurl = `https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=ed339baf4e7d44ff86f7ac3ec4ed9c33&Type=json&pIndex=1&ATPT_OFCDC_SC_CODE=B10&SD_SCHUL_CODE=7010087&MLSV_YMD=${date.join(
      ""
    )}`;

    let done;
    setLoadedLunch(true);

    setTimeout(() => {
      if (!done && setLoadedLunch) {
        setLoadedLunch(false);
        done = true;
      }
    }, 1000);

    axios
      .get(LunchAPIurl)
      .then((json) => {
        setLoadedLunch(true);
        done = true;

        //급식정보
        let ReceivedLunchInfo;

        if (json.data.mealServiceDietInfo) {
          switch (json.data.mealServiceDietInfo[0].head[1].RESULT.CODE) {
            default:
              ReceivedLunchInfo = "급식 정보를 불러오는 도중에 오류가 발생하였습니다.";
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
                origin: JSON.stringify(
                  obj.ORPLC_INFO.replace(/<br\s*[/]?>/gi, ",")
                    .trim()
                    .split(",")
                ),
                cal: obj.CAL_INFO,
                ntr: JSON.stringify(
                  obj.NTR_INFO.replace(/<br\s*[/]?>/gi, ",")
                    .trim()
                    .split(",")
                ),
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
      .catch((e) => {
        console.log(e);
        alert("오류: " + e);
      });
  }

  let LunchInfo;
  if (lunch.state === "null") {
    LunchInfo = "데이터 없음";
  } else if (lunch.state === "200") {
    LunchInfo = lunch.msg;
  } else if (lunch.state === "success") {
    LunchInfo = Object.values(JSON.parse(lunch.lunch)).map((l) => <p key={l}>{l}</p>);
  } else {
    LunchInfo = lunch.msg;
  }

  //원산지
  let LunchOrigin;
  if (!lunch.origin) {
    LunchOrigin = null;
  } else {
    LunchOrigin = Object.values(JSON.parse(lunch.origin)).map((o) => <p key={o}>{o}</p>);
  }

  //영양 성분
  let LunchNTR;
  if (!lunch.ntr) {
    LunchNTR = null;
  } else {
    LunchNTR = Object.values(JSON.parse(lunch.ntr)).map((n) => <p key={n}>{n}</p>);
  }

  //급식 전환
  function changeLunch(value) {
    if (value === 1) {
      //다음날
      setDate(getDate(addDays(new Date(date.join(",")), 1)));
    } else if (value === -1) {
      //이전날
      setDate(getDate(subDays(new Date(date.join(",")), 1)));
    }
  }

  //responsive : PC
  const isDesktopOrLaptop = useMediaQuery({
    query: MediaQuery("PC"),
  });

  let dateTitle = isDesktopOrLaptop
    ? `${date[0]}년 ${date[1]}월 ${date[2]}일 (${week[rawdate.getDay()]})`
    : `${date[1]}월 ${date[2]}일 (${week[rawdate.getDay()]})`;

  let unfocusedDateTitle = isDesktopOrLaptop ? "yyyy년 MM월 dd일" : " MM월 dd일";

  const Modalstyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "16rem",
    height: "32rem",
    borderRadius: "20px",
    boxShadow: "rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px",
    textAlign: "center",
  };

  //원산지 모달창
  const [openOrigin, setOpenOrigin] = useState(false);
  const handleOpenOrigin = () => setOpenOrigin(true);
  const handleCloseOrigin = () => setOpenOrigin(false);

  //영양성분 모달창
  const [openNTR, setOpenNTR] = useState(false);
  const handleOpenNTR = () => setOpenNTR(true);
  const handleCloseNTR = () => setOpenNTR(false);

  return (
    <>
      <Navbar type="menu" name={props?.name} />
      <div className="wrapper center" style={{ overflowX: "hidden" }}>
        <div
          className="content"
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: "row",
            flexWrap: "nowrap",
            width: "100%",
            position: "relative",
          }}
        >
          <Card className={styles.previousCard}>
            <h3>{format(subDays(rawdate, 1), unfocusedDateTitle)}</h3>
            <div className={styles.LunchInfoMiddle}>
              <div className={styles.LunchInfo}>-</div>
            </div>
          </Card>

          <Card className={styles.currentCard}>
            <h2>{dateTitle}</h2>
            <div className={styles.LunchInfoMiddle}>
              <IconButton
                className={styles.previousBtn}
                onClick={() => {
                  changeLunch(-1);
                }}
                sx={{ margin: "4px" }}
              >
                <ChevronLeftIcon />
              </IconButton>
              <div className={styles.LunchInfo}>
                {!LoadedLunch && <p>급식 정보를 불러오는 중입니다...</p>}
                {LoadedLunch && <>{LunchInfo}</>}
              </div>
              <IconButton
                className={styles.nextBtn}
                onClick={() => {
                  changeLunch(1);
                }}
                sx={{ margin: "4px" }}
              >
                <ChevronRightIcon />
              </IconButton>
            </div>
            <div className={styles.MoreLunchInfo}>
              <Stack spacing={2} direction="row">
                <Button
                  variant="text"
                  disabled={lunch.state !== "success" ? true : false}
                  onClick={() => handleOpenNTR()}
                >
                  영양 성분
                </Button>
                <Modal open={openNTR} onClose={handleCloseNTR} closeAfterTransition>
                  <Fade in={openNTR}>
                    <Card style={Modalstyle}>
                      <Typography variant="h5" component="h1" sx={{ margin: "2rem" }}>
                        영양 성분
                      </Typography>
                      <div className={styles.modalInfo}>{LunchNTR}</div>
                      <Button
                        variant="text"
                        onClick={() => {
                          handleCloseNTR();
                        }}
                      >
                        닫기
                      </Button>
                    </Card>
                  </Fade>
                </Modal>
                <Button
                  variant="text"
                  disabled={lunch.state !== "success" ? true : false}
                  onClick={() => handleOpenOrigin()}
                >
                  원산지
                </Button>
                <Modal open={openOrigin} onClose={handleCloseOrigin} closeAfterTransition>
                  <Fade in={openOrigin}>
                    <Card style={Modalstyle}>
                      <Typography variant="h5" component="h1" sx={{ margin: "2rem" }}>
                        원산지
                      </Typography>
                      <div className={styles.modalInfo}>{LunchOrigin}</div>
                      <Button
                        variant="text"
                        onClick={() => {
                          handleCloseOrigin();
                        }}
                      >
                        닫기
                      </Button>
                    </Card>
                  </Fade>
                </Modal>
              </Stack>
            </div>
          </Card>

          <Card className={styles.nextCard}>
            <h3>{format(addDays(rawdate, 1), unfocusedDateTitle)}</h3>
            <div className={styles.LunchInfoMiddle}>
              <div className={styles.LunchInfo}>-</div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

import { ChevronLeft, ExpandLess, ExpandMore } from "@mui/icons-material";
import { Box, Button, Card, Collapse, IconButton, Typography } from "@mui/material";
import axios from "axios";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import settings from "../../../settings";
import styles from "../Settings.module.css";

export default function ManageSessions(props) {
  const { setMenu, userInfo } = props?.data;

  //Collapse
  const [isOpened, setOpened] = useState({
    Session: {},
  });

  //세션 관리
  const [session, setSession] = useState(null);

  async function getSession() {
    await axios
      .get(`${settings.api.domain}/api/getSession`, { withCredentials: true })
      .then((res) => {
        switch (res.data.status) {
          case "success":
            setSession(JSON.parse(res.data?.Session));
            setMenu("manageSessions");

            let newOpenedObject = isOpened?.Session;

            JSON.parse(res.data?.Session)?.map((s, i) => {
              return (newOpenedObject[i] = false);
            });

            setOpened({
              ...isOpened,
              Session: newOpenedObject,
            });

            break;

          case "unauthorized":
            alert(res.data.message);
            window.location.replace("/login");
            return;
          case "invalid":
            window.location.replace("/login");
            return;

          default:
            alert(res.data.message);
            break;
        }
      });
  }
  useEffect(() => {
    getSession();
  }, []);

  const deleteSession = (token, isCurrent) => {
    let msg = "";

    if (isCurrent) {
      msg = "현재 세션에서 로그아웃하시겠습니까? 다시 로그인 시 본인인증이 필요합니다.";
    } else {
      msg = "해당 세션을 삭제하시겠습니까?";
    }

    if (!window.confirm(msg)) return;
    axios
      .get(`${settings.api.domain}/api/deleteSession`, {
        params: { token: token },
        withCredentials: true,
      })
      .then((res) => {
        switch (res.data.status) {
          case "unauthorized":
            alert(res.data.message);
            window.location.replace("/login");
            return;
          case "invalid":
            window.location.replace("/login");
            return;

          case "notFound":
            alert(res.data.message);
            getSession();
            break;

          case "success":
            alert(res.data.message);
            if (isCurrent) return window.location.replace("/");
            getSession();
            break;

          default:
            console.log(res.data.message);
            alert("세션을 삭제하는 도중에 오류가 발생하였습니다.");
            break;
        }
      });
  };

  return (
    <Box sx={{ pb: 7 }}>
      <Box component="div" className={styles.centerAlign} sx={{ marginBottom: "8px" }}>
        <IconButton onClick={() => setMenu("main")}>
          <ChevronLeft />
        </IconButton>
        돌아가기
      </Box>
      <Card className={styles.infoCard}>
        <span className={styles.cardHeader}>로그인 세션 기록 ({session?.length || 0})</span>
        {session &&
          session?.map((s, i) => (
            <React.Fragment key={i}>
              {isOpened?.Session[i] ? (
                <div
                  style={{
                    paddingTop: i === 0 ? null : "8px",
                    alignItems: "flex-start",
                  }}
                  className={styles.sessionList}
                  onClick={() => {
                    setOpened({
                      ...isOpened,
                      Session: { ...isOpened?.Session, [i]: false },
                    });
                  }}
                >
                  <span
                    className={styles.selected}
                    style={{
                      borderBottom:
                        localStorage.getItem("theme") === "dark" ? "1px solid #fff" : null,
                    }}
                  >
                    {s?.agent}
                  </span>
                  <ExpandLess />
                </div>
              ) : (
                <div
                  style={{
                    paddingTop: i === 0 ? null : "8px",
                    alignItems: "flex-start",
                  }}
                  className={styles.sessionList}
                  onClick={() =>
                    setOpened({
                      ...isOpened,
                      Session: { ...isOpened?.Session, [i]: true },
                    })
                  }
                >
                  <span>{s?.agent}</span>
                  <ExpandMore />
                </div>
              )}
              <Collapse in={isOpened?.Session[i]} unmountOnExit>
                <table className={styles.session_table}>
                  <tbody>
                    <tr className={`${styles.flexTr} ${styles.columnTr}`}>
                      <td>접속 시간</td>
                      <td>{format(new Date(s?.Date), "yyyy년 MM월 dd일 hh시 mm분 ss초")}</td>
                    </tr>
                    <tr className={`${styles.flexTr} ${styles.columnTr}`}>
                      <td>접속 환경</td>
                      <td>{s?.agent}</td>
                    </tr>
                    <tr className={`${styles.flexTr} ${styles.columnTr}`}>
                      <td>IP 주소</td>
                      <td>{s?.IP || "해당 없음"}</td>
                    </tr>
                    {JSON.parse(userInfo?.Session)[userInfo?.currentSession]?.token ===
                      s?.token && (
                      <tr>
                        <td>
                          <Typography color="primary">현재 세션</Typography>
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td>
                        {JSON.parse(userInfo?.Session)[userInfo?.currentSession]?.token ===
                        s?.token ? (
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => deleteSession(s?.token, true)}
                          >
                            로그아웃
                          </Button>
                        ) : (
                          <Button
                            variant="contained"
                            color="error"
                            onClick={() => deleteSession(s?.token, false)}
                          >
                            삭제
                          </Button>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Collapse>
            </React.Fragment>
          ))}
      </Card>
    </Box>
  );
}

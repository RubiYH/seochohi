import { Card } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import settings from "../../settings";
import { checkSession } from "../Modules/Authorization/checkSession";
import { switchSessionResult } from "../Modules/Authorization/sessionSwitches";
import Navbar from "../Modules/Navbar/Navbar";
import styles from "./MyClass.module.css";
import TimeTable from "./MyClass_timetable/TimeTable";

export default function MyClass(props) {
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

  const [timetable, setTimetable] = useState(null);

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
            break;
          case "unauthorized":
            alert(res.data.message);
            window.location.replace("/login");
            return;
          case "invalid":
            window.location.replace("/login");
            return;
          default:
            alert("오류가 발생하였습니다. " + res.data.message);
            break;
        }
      });
  }, [isAuth]);

  return (
    <>
      <Navbar type="menu" name={props?.name} />
      <div className="wrapper top">
        <div className="content column">
          {isAuth && (
            <>
              <h2 style={{ textAlign: "center" }}>
                {String(userData.userID).slice(0, 1)}학년{" "}
                {parseInt(String(userData.userID).slice(1, 3))}반
              </h2>
              <div className={styles.Card}>
                <span className={styles.title}>학급 시간표</span>
                {timetable && <TimeTable data={timetable} tooltip={true} />}
              </div>
              <br />
              <Card className={styles.Card}>
                <span className={styles.title}>수행평가</span>
              </Card>
            </>
          )}
        </div>
      </div>
    </>
  );
}

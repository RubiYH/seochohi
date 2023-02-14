import { useMediaQuery } from "react-responsive";
import { MediaQuery } from "../../Modules/MediaQuery";
import styles from "./MyClassTimeTable.module.css";

import axios from "axios";
import { useEffect, useState } from "react";
import settings from "../../../settings";
import { checkSession } from "../../Modules/Authorization/checkSession";
import { switchSessionResult } from "../../Modules/Authorization/sessionSwitches";
import Navbar from "../../Modules/Navbar/Navbar";
import TimeTable from "./TimeTable";

export default function MyClassTimeTable(props) {
  //JWT 인증
  const [isAuth, setAuth] = useState(false);
  const [userData, setUserData] = useState({
    status: null,
    userID: null,
    username: null,
  });

  useEffect(() => {
    checkSession().then((c) => {
      setAuth(c.isAuth);
      setUserData(c.userData);

      if (!c.isAuth) {
        switchSessionResult(c.userData.status);
      }
    });
  }, []);

  //responsive : PC
  const isDesktopOrLaptop = useMediaQuery({
    query: MediaQuery("PC"),
  });

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
      <div className={`wrapper ${styles.wrapper_timetable} top`}>
        {isAuth && (
          <>
            <div className="content center column">
              <h2>
                {String(userData.userID).charAt(0) || "?"}학년{" "}
                {parseInt(String(userData.userID).substring(1, 3)) || "?"}반
                시간표
              </h2>
              <br />
              {timetable && <TimeTable data={timetable} tooltip={true} />}
            </div>
          </>
        )}
      </div>
    </>
  );
}

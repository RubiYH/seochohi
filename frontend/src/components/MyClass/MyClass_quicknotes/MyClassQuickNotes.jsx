import { useMediaQuery } from "react-responsive";
import { MediaQuery } from "../../Modules/MediaQuery";
import styles from "./MyClassQuickNotes.module.css";

import { Edit } from "@mui/icons-material";
import { Card, CardActionArea, Divider, Fab } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import settings from "../../../settings";
import { checkSession } from "../../Modules/Authorization/checkSession";
import { switchSessionResult } from "../../Modules/Authorization/sessionSwitches";
import Navbar from "../../Modules/Navbar/Navbar";

export default function MyClassQuickNotes(props) {
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

  const [status, setStatus] = useState(null);
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    if (!isAuth) return;

    axios
      .get(`${settings.api.domain}/api/getNotes`, {
        params: { type: "list" },
        withCredentials: true,
      })
      .then((res) => {
        switch (res.data.status) {
          case "empty":
            setStatus(res.data.message);
            break;
          case "success":
            setNotes(res.data.data);
            setStatus(res.data.message);
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
  }, [isAuth]);

  return (
    <>
      <Navbar type="menu" name={props?.name} />
      <div className="wrapper top">
        <span className={styles.status}>{status}</span>
        <div className="content column">
          {notes?.length > 0 &&
            notes?.map((n) => (
              <Link
                to={`/myclass/quicknotes/${n.id}`}
                className={styles.noteCard}
                key={n.id}
              >
                <Card elevation={0}>
                  <CardActionArea>
                    <h2>{n.title}</h2>
                    <span className={styles.lastEditedAt}>
                      마지막 수정: {n.lastEditedAt}
                    </span>
                    <Divider variant="fullWidth" sx={{ marginTop: "12px" }} />
                  </CardActionArea>
                </Card>
              </Link>
            ))}
          {/* 플로팅 버튼 */}
          <Link to="/myclass/quicknotes/new">
            <Fab
              color="primary"
              sx={{ position: "fixed", right: "24px", bottom: "24px" }}
            >
              <Edit />
            </Fab>
          </Link>
        </div>
      </div>
    </>
  );
}

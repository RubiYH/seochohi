import axios from "axios";
import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { useParams } from "react-router-dom";
import settings from "../../../settings";
import { checkSession } from "../../Modules/Authorization/checkSession";
import { switchSessionResult } from "../../Modules/Authorization/sessionSwitches";
import { MediaQuery } from "../../Modules/MediaQuery";
import Navbar from "../../Modules/Navbar/Navbar";

import styles from "./MyClassQuickNotesView.module.css";

export default function MyClassQuickNotesView(props) {
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

  const { id } = useParams();

  useEffect(() => {
    if (!isAuth) return;

    axios
      .get(`${settings.api.domain}/api/getNotes`, {
        params: { userID: userData.userID, id: id, type: "view" },
      })
      .then((res) => {
        switch (res.data.status) {
          case "success":
            setMemo(res.data.data);
            setText(res.data.data?.content);
            break;
          default:
            alert(res.data.message);
            window.history.go(-1);
            break;
        }
      });
  }, [isAuth]);

  const [Memo, setMemo] = useState(null);

  const [Text, setText] = useState(null);

  return (
    <>
      <Navbar type="back" name={props?.name} />
      <div className="wrapper top fullHeight" style={{ padding: 0 }}>
        <div className="content">
          <div
            id="memoInput"
            className={styles.memoInput}
            contentEditable
            onInput={(e) => {
              setText(e.target.innerText);
              if (e.target.innerText !== Memo?.content) {
                window.beforeunload = true;
              } else {
                window.beforeunload = false;
              }
            }}
            suppressContentEditableWarning
          >
            {Memo?.content}
          </div>
        </div>
      </div>
    </>
  );
}

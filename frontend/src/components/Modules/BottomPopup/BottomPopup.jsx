import { Close } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import axios from "axios";
import parse from "html-react-parser";
import { useEffect, useRef, useState } from "react";
import { CSSTransition } from "react-transition-group";
import settings from "../../../settings";
import styles from "./BottomPopup.module.css";

export default function BottomPopup() {
  const [PopupList, setPopupList] = useState([]);
  useEffect(() => {
    if (!settings.server.BottomPopup) return;

    axios
      .get(`${settings.api.domain}/api/getBottomPopupList`)
      .then((json) => {
        setPopupList(json.data.data);
        setTimeout(() => {
          setClosePopup(false);
        }, 500);
      })
      .catch((err) => {
        console.log(err);
        setPopupList([]);
      });
  }, []);

  const [closePopup, setClosePopup] = useState(true);

  const nodeRef = useRef(null);

  let isAndroid = window.Android;

  return (
    <>
      {!isAndroid && (
        <div className={styles.container}>
          {PopupList[0] && (
            <CSSTransition
              in={!closePopup}
              timeout={300}
              nodeRef={nodeRef}
              classNames={{
                enter: styles["popup-enter"],
                enterActive: styles["popup-enter-active"],
                exit: styles["popup-exit"],
                exitActive: styles["popup-exit-active"],
              }}
              unmountOnExit
              key={PopupList[0].id}
            >
              <div className={styles.card} ref={nodeRef}>
                <div className={styles.header}>
                  <strong className={styles.popup_title}>
                    {PopupList[0].title}
                  </strong>
                  <IconButton onClick={() => setClosePopup(true)}>
                    <Close fontSize="small" />
                  </IconButton>
                </div>
                <p style={{ paddingLeft: "8px" }}>
                  {parse(PopupList[0].description)}
                </p>
              </div>
            </CSSTransition>
          )}
        </div>
      )}
    </>
  );
}

import {
  Card,
  CardActionArea,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useState } from "react";
import { useCookies } from "react-cookie";
import { useMediaQuery } from "react-responsive";
import { CSSTransition } from "react-transition-group";
import settings from "../../../settings";
import homestyles from "../../Home/Home.module.css";
import { MediaQuery } from "../MediaQuery";
import styles from "./Notice.module.css";

//MUI
import CampaignIcon from "@mui/icons-material/Campaign";
import CloseIcon from "@mui/icons-material/Close";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

export default function Notice(props) {
  //responsive : PC
  const isDesktopOrLaptop = useMediaQuery({
    query: MediaQuery("PC"),
  });

  //cookie
  const [cookies, setCookies, removeCookies] = useCookies(["notice"]);

  function SeverityIcon(props) {
    let Severity = props?.Severity;

    switch (Severity) {
      case "Info":
        return <InfoIcon color="info" />;

      case "Error":
        return <ErrorIcon color="error" />;

      case "Notice":
        return <CampaignIcon color="warning" />;

      default:
        return <InfoIcon color="info" />;
    }
  }

  const [NoticeData, setNoticeData] = useState([]);
  const [closeNotice, setCloseNotice] = useState(false);

  const isAuth = props?.isAuth;

  const mH = "72px";

  useEffect(() => {
    //Notice 불러오기
    axios
      .get(`${settings.api.domain}/api/getNotice`)
      .then((json) => {
        //공지 끔
        if (
          json.data.data[0]?.id === cookies.notice?.id &&
          cookies.notice?.read
        )
          return;

        if (json.data?.data.length === 0) return;
        setNoticeData(json.data.data);
        let el = document.getElementsByClassName(homestyles.homegrid)[0];
        el.style.marginTop = mH;
        setCloseNotice(true);
      })
      .catch((err) => {
        console.log(err);
        setNoticeData([
          {
            severity: "Error",
            title: `공지를 불러오지 못하였습니다. (${err.message})`,
            description: "-",
          },
        ]);
      });
  }, []);

  const nodeRef = useRef(null);

  return (
    <CSSTransition
      in={closeNotice}
      nodeRef={nodeRef}
      timeout={300}
      classNames={{
        enter: styles["notice-enter"],
        enterActive: styles["notice-enter-active"],
        exit: styles["notice-exit"],
        exitActive: styles["notice-exit-active"],
      }}
      unmountOnExit
      onExit={() => {
        let el = document.getElementsByClassName(homestyles.homegrid)[0];
        el.style.marginTop = 0;
      }}
    >
      <Grid
        item
        xs={12}
        ref={nodeRef}
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          padding: "16px",
          paddingTop: 0,
        }}
      >
        <CardActionArea
          component="div"
          style={{ borderRadius: "var(--paper-radius-sm)" }}
        >
          <Link
            to={`${NoticeData ? NoticeData[0]?.url : "#"}`}
            style={{ textDecoration: "none" }}
          >
            <Card className={styles.NoticeBoard}>
              <SeverityIcon Severity={NoticeData[0]?.severity} />
              <Typography
                color="GrayText"
                paddingLeft={1}
                marginRight={2}
                textOverflow="ellipsis"
                whiteSpace="nowrap"
                overflow="hidden"
                fontSize="0.8rem"
              >
                {NoticeData[0] && (
                  <span>
                    {NoticeData[0]?.time ? `[${NoticeData[0]?.time}] ` : ""}
                    {NoticeData[0]?.title}
                  </span>
                )}
              </Typography>
              <IconButton
                sx={{ position: "absolute", right: 0 }}
                onTouchStart={(event) => event.stopPropagation()}
                onMouseDown={(event) => event.stopPropagation()}
                onClick={(e) => {
                  e.preventDefault();
                  setCloseNotice(false);
                  setCookies("notice", { id: NoticeData[0]?.id, read: true });
                  if (isDesktopOrLaptop) {
                    document.getElementById("sideMenu").style.height = `calc(${
                      document.getElementById("sideMenu").style.height
                    } - ${mH})`;
                  }
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Card>
          </Link>
        </CardActionArea>
      </Grid>
    </CSSTransition>
  );
}

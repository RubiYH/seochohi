import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";

// MUI
import {
  AppBar,
  Box,
  Button,
  ButtonBase,
  Collapse,
  Divider,
  Fade,
  List,
  ListItemButton,
  ListItemText,
  Modal,
  SwipeableDrawer,
  Toolbar,
  Typography,
} from "@mui/material";

//icons
import { ExpandLess, ExpandMore, FiberNew, Help, Info } from "@mui/icons-material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import CloseIcon from "@mui/icons-material/Close";
import HomeIcon from "@mui/icons-material/Home";
import MenuIcon from "@mui/icons-material/Menu";
import SettingsIcon from "@mui/icons-material/Settings";
import IconButton from "@mui/material/IconButton";
import settings from "../../../settings";

//lists
import { myclassList, timeList, wikiList } from "./Menus";

//responsive
import axios from "axios";
import { useMediaQuery } from "react-responsive";
import { MediaQuery } from "../MediaQuery";

export default function Navbar(props) {
  const navigate = useNavigate();

  const [isLoggedIn, setLogIn] = useState(false);
  //로그인 여부

  const [isPending, setPending] = useState(false);

  useEffect(() => {
    axios.get(`${settings.api.domain}/api/auth`, { withCredentials: true }).then((res) => {
      switch (res.data.status) {
        case "success":
          setLogIn(false);
          break;
        case "unauthorized":
          if (res.data.pending) {
            setPending(true);
            setLogIn(false);
          } else {
            setLogIn(true);
          }
          break;
        default:
          setLogIn(true);
          break;
      }
    });
  }, []);

  function Pending() {
    return (
      <Button
        sx={{
          position: "absolute",
          marginRight: "1rem",
          right: 0,
          textDecoration: "none",
          color: "#ffffff",
          background: "#9c27b0",
        }}
        variant="contained"
        disableElevation
        onClick={() => setPO(true)}
      >
        승인 대기 중
      </Button>
    );
  }

  const [pendingOpen, setPO] = useState(false);

  //로그인 버튼
  function LoginButton() {
    if (!isLoggedIn) return;
    if (navType === "login") return;
    if (navType === "onlyback") return;

    return (
      <Link
        to="/login"
        style={{
          position: "absolute",
          marginRight: "8px",
          right: 0,
          textDecoration: "none",
          color: "initial",
        }}
      >
        <Button variant="contained" disableElevation color="info">
          로그인
        </Button>
      </Link>
    );
  }

  //메모 저장 버튼
  function SaveMemo() {
    if (navType !== "memo") return;

    return (
      <Button
        onClick={() => submitMemo()}
        variant="text"
        disableElevation
        color="success"
        sx={{ position: "absolute", marginRight: "1rem", right: 0 }}
      >
        저장
      </Button>
    );
  }

  function submitMemo() {
    axios.get(`${settings.api.domain}/api/saveMemo`);
  }

  //responsive : PC
  const isDesktopOrLaptop = useMediaQuery({
    query: MediaQuery("PC"),
  });

  //Drawer
  const [open, setOpen] = useState({
    sidebar: false,
    sub_wiki: false,
    sub_forest: false,
    sub_time: false,
    sub_myclass: false,
  });
  const { sidebar, sub_wiki, sub_forest, sub_time, sub_myclass } = open;
  const onChange = (name, value) => {
    setOpen({
      ...open,
      [name]: value,
    });
  };

  const navType = props?.type || "menu";

  window.beforeunload = null;

  useEffect(() => {
    //안드로이드 상태바 색상 변경
    if (window.Android) {
      window.Android.changeStatusBarColor(
        localStorage.getItem("theme") === "dark"
          ? settings.style.darkColor
          : settings.style.primaryColor
      );
    }
  }, []);

  // let ch = false;

  // window.addEventListener("scroll", () => {
  //   let scrollPosition =
  //     document.documentElement.scrollTop || document.body.scrollTop;

  //   if (window.Android) {
  //     if (scrollPosition >= 60 && !ch) {
  //       window.Android.changeStatusBarColor("#ffffff");
  //       ch = true;
  //     } else if (scrollPosition < 60 && ch) {
  //       window.Android.changeStatusBarColor(settings.style.primaryColor);
  //       ch = false;
  //     }
  //   }
  // });

  const textColor = localStorage.getItem("theme") === "dark" ? "#fff" : "#000";

  //새 노트 -> NEW 아이콘 띄우기
  const [isNew, setNew] = useState({});

  useEffect(() => {
    setNew({});
  }, []);

  return (
    <>
      <div className={styles.navbar} style={props?.style}>
        {/* 모바일 네비바 */}
        {!isDesktopOrLaptop && (
          <Box sx={{ flexGrow: 1 }}>
            <AppBar
              position="static"
              sx={{ mr: 2 }}
              color="transparent"
              className={styles.navbar}
              elevation={0}
            >
              <Toolbar sx={{ padding: "0 8px 0 8px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "row",
                    color: textColor,
                  }}
                >
                  {navType === "menu" && (
                    <IconButton
                      sx={{ color: textColor }}
                      onClick={() => {
                        onChange("sidebar", true);
                      }}
                    >
                      <MenuIcon sx={{ color: textColor }} />
                    </IconButton>
                  )}
                  {(navType === "back" || navType === "login" || navType === "onlyback") && (
                    <IconButton
                      sx={{ color: textColor }}
                      onClick={() => {
                        navigate(-1);
                      }}
                    >
                      <ChevronLeftIcon sx={{ color: textColor }} />
                    </IconButton>
                  )}
                  {navType === "memo" && (
                    <IconButton
                      sx={{ color: textColor }}
                      onClick={() => {
                        if (window.beforeunload) {
                          if (window.confirm("저장하지 않고 나가시겠습니까?")) {
                            navigate(-1);
                          } else {
                            return;
                          }
                        } else {
                          navigate(-1);
                        }
                      }}
                    >
                      <ChevronLeftIcon sx={{ color: textColor }} />
                    </IconButton>
                  )}

                  <SwipeableDrawer
                    anchor="left"
                    open={sidebar}
                    onClose={() => {
                      onChange("sidebar", !sidebar);
                    }}
                    onOpen={() => {}}
                    disableSwipeToOpen={true}
                  >
                    <div className={styles.sidebarWrapper}>
                      <div className={styles.sidebar}>
                        <div className={styles.sidebarHeader}>
                          <Typography
                            p={2}
                            sx={{
                              fontSize: "1.25rem",
                              padding: "8px",
                            }}
                            onClick={() => {
                              onChange("sidebar", !sidebar);
                            }}
                          >
                            <Link to="/" className={styles["nav_sub_a"]}>
                              <IconButton>
                                <HomeIcon />
                              </IconButton>
                            </Link>
                            <IconButton onClick={() => onChange("sidebar", !sidebar)}>
                              <CloseIcon />
                            </IconButton>
                          </Typography>
                        </div>

                        <Divider />
                        {/* 서초위키 */}
                        <List>
                          <ListItemButton
                            onClick={() => {
                              onChange("sub_wiki", !sub_wiki);
                            }}
                          >
                            <ListItemText primary="서초위키" sx={{ marginLeft: "8px" }} />
                            {sub_wiki ? <ExpandLess /> : <ExpandMore />}
                          </ListItemButton>
                          <Collapse in={sub_wiki} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                              {wikiList.map((m) => (
                                <Link
                                  to={m.url}
                                  className={styles["nav_sub_a"]}
                                  key={m.name}
                                  onClick={() => {
                                    onChange("sidebar", !sidebar);
                                  }}
                                >
                                  <ListItemButton sx={{ pl: 4 }}>
                                    <ListItemText
                                      primary={`• ${m.name}`}
                                      sx={{ marginLeft: "8px" }}
                                    />
                                  </ListItemButton>
                                </Link>
                              ))}
                            </List>
                          </Collapse>
                        </List>
                        {/* 서초고숲 */}
                        <Link
                          to="/forest"
                          className={styles["nav_sub_a"]}
                          onClick={() => {
                            onChange("sidebar", !sidebar);
                          }}
                        >
                          <List>
                            <ListItemButton>
                              <ListItemText primary="서초고숲" sx={{ marginLeft: "8px" }} />
                            </ListItemButton>
                          </List>
                        </Link>
                        {/* 서초타임 */}
                        <List>
                          <ListItemButton
                            onClick={() => {
                              onChange("sub_time", !sub_time);
                            }}
                          >
                            <ListItemText primary="서초타임" sx={{ marginLeft: "8px" }} />
                            {isNew && isNew?.time ? <FiberNew color="error" /> : null}
                            {/* {sub_time ? <ExpandLess /> : <ExpandMore />} */}
                          </ListItemButton>
                          <Collapse in={sub_time} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                              {timeList.map((m) => (
                                <Link
                                  to={m.url}
                                  className={styles["nav_sub_a"]}
                                  key={m.name}
                                  onClick={(e) => {
                                    if (m?.disabled) {
                                      e.preventDefault();
                                      alert(`${m.name} 이벤트가 종료되었습니다.`);
                                      return;
                                    }
                                    onChange("sidebar", !sidebar);
                                  }}
                                >
                                  <ListItemButton sx={{ pl: 4 }}>
                                    <ListItemText primary={`• ${m.name}`} />
                                    {isNew && isNew?.time?.[m.name] ? (
                                      <FiberNew color="error" />
                                    ) : null}
                                  </ListItemButton>
                                </Link>
                              ))}
                            </List>
                          </Collapse>
                        </List>
                        {/* 나의 학급 */}
                        {!isLoggedIn && (
                          <List>
                            <ListItemButton
                              onClick={() => {
                                onChange("sub_myclass", !sub_myclass);
                              }}
                            >
                              <ListItemText primary="나의 학급" sx={{ marginLeft: "8px" }} />
                              {sub_myclass ? <ExpandLess /> : <ExpandMore />}
                            </ListItemButton>
                            <Collapse in={sub_myclass} timeout="auto" unmountOnExit>
                              <List component="div" disablePadding>
                                {myclassList.map((m) => (
                                  <Link
                                    to={m.url}
                                    className={styles["nav_sub_a"]}
                                    key={m.name}
                                    onClick={(e) => {
                                      if (m?.enabled === false) return e.preventDefault();
                                      onChange("sidebar", !sidebar);
                                    }}
                                  >
                                    <ListItemButton sx={{ pl: 4 }} disabled={m?.enabled === false}>
                                      <ListItemText primary={`• ${m.name}`} />
                                    </ListItemButton>
                                  </Link>
                                ))}
                              </List>
                            </Collapse>
                          </List>
                        )}
                      </div>
                      {/* 하단 네비바 */}
                      <div className={styles.sidebarBottom}>
                        {!isLoggedIn && (
                          <Link
                            to="/settings"
                            className={styles["nav_sub_a"]}
                            onClick={() => {
                              onChange("sidebar", !sidebar);
                            }}
                          >
                            <ButtonBase>
                              <SettingsIcon sx={{ marginLeft: "8px" }} color="action" />
                              <Typography p={1}>설정</Typography>
                            </ButtonBase>
                          </Link>
                        )}

                        <Link
                          to="/support"
                          className={styles["nav_sub_a"]}
                          onClick={() => {
                            onChange("sidebar", !sidebar);
                          }}
                        >
                          <ButtonBase>
                            <Help sx={{ marginLeft: "8px" }} color="primary" />
                            <Typography p={1}>FAQ 및 문의</Typography>
                          </ButtonBase>
                        </Link>
                        <Link
                          to="/about"
                          className={styles["nav_sub_a"]}
                          onClick={() => {
                            onChange("sidebar", !sidebar);
                          }}
                        >
                          <ButtonBase>
                            <Info sx={{ marginLeft: "8px" }} color="secondary" />
                            <Typography p={1}>정보</Typography>
                          </ButtonBase>
                        </Link>
                      </div>
                    </div>
                  </SwipeableDrawer>
                  <Typography>{props?.name}</Typography>
                </div>
                {/* 로그인 버튼 */}
                <LoginButton />
                <SaveMemo />
                {isPending && <Pending />}
              </Toolbar>
            </AppBar>
          </Box>
        )}
      </div>
      <Modal open={pendingOpen} onClose={() => setPO(false)} closeAfterTransition>
        <Fade in={pendingOpen}>
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
            <h2
              style={{
                color: "#00a152",
                margin: "8px 0 8px 0",
                fontSize: "1.25rem",
              }}
            >
              재학생 인증 대기 중입니다.
            </h2>
            <br />
            <div style={{ textAlign: "left" }}>
              <span style={{ fontSize: "1rem" }}>
                재학생 인증은 1일 이내로 처리되며, 재학생 인증 완료 후 로그인하실 수 있습니다.
              </span>
              <br />
              <span style={{ display: "block" }}>
                재학생 인증 완료 시 가입이 승인되며, 인증 과정에 문제가 있을 시 가입이 취소될 수
                있습니다.
              </span>
              <span
                style={{
                  display: "block",
                  marginTop: "24px",
                  fontSize: "0.8rem",
                }}
              >
                문의: shs.startup@gmail.com
              </span>
              <br />
              <Button
                variant="contained"
                onClick={() => setPO(false)}
                sx={{ display: "block", margin: "0 auto" }}
              >
                닫기
              </Button>
            </div>
          </Box>
        </Fade>
      </Modal>
    </>
  );
}

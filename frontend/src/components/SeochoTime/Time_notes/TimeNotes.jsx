import { useMediaQuery } from "react-responsive";
import { MediaQuery } from "../../Modules/MediaQuery";
import styles from "./TimeNotes.module.css";

import {
  Delete,
  ExpandLess,
  ExpandMore,
  Favorite,
  FavoriteBorder,
  FileUploadRounded,
} from "@mui/icons-material";
import {
  Card,
  CircularProgress,
  Collapse,
  Divider,
  Fab,
  Grid,
  IconButton,
} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router-dom";
import settings from "../../../settings";
import { checkSession } from "../../Modules/Authorization/checkSession";
import { switchSessionResult } from "../../Modules/Authorization/sessionSwitches";
import convertRemToPixels from "../../Modules/convertRemToPixels";
import { tags_others, tags_subject } from "./tags";

import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";

import {
  TransformComponent,
  TransformWrapper,
} from "@pronestor/react-zoom-pan-pinch";
import { elapsedTime } from "../../Modules/elapsedTime";
import Navbar from "../../Modules/Navbar/Navbar";

export default function TimeNotes(props) {
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

  //responsive : Mobile
  const isTabletOrMobile = useMediaQuery({
    query: MediaQuery("Mobile"),
  });

  const [eventImg, setEventImg] = useState(null);

  const [grade, setGrade] = useState(null);

  useEffect(() => {
    setGrade(String(userData.userID).charAt(0));
  }, [userData.userID]);

  useEffect(() => {
    if (!isAuth) return;

    axios
      .get(`${settings.api.domain}/api/getEventBanner`, {
        params: { eventName: "Notes" },
      })
      .then((res) => {
        switch (res.data.status) {
          case "success":
            setEventImg(res.data.path);
            break;
          default:
            setEventImg(null);
            break;
        }
      });
  }, [isAuth]);

  //과목 태그
  const [selectedTags_subject, setST_subject] = useState([]);

  const AddTag_subject = (grade, index) => {
    if (selectedTags_subject.some((s) => s === tags_subject[grade - 1][index]))
      return;
    setST_subject([...selectedTags_subject, tags_subject[grade - 1][index]]);
  };

  const deleteTag_subject = (grade, name) => {
    const getIndex = selectedTags_subject.findIndex((s) => s === name);
    setST_subject(selectedTags_subject.filter((s, i) => i !== getIndex));
  };

  //기타 태그
  const [selectedTags_others, setST_others] = useState([]);

  const AddTag_others = (index) => {
    if (selectedTags_others.some((s) => s === tags_others[index])) return;
    setST_others([...selectedTags_others, tags_others[index]]);
  };

  const deleteTag_others = (name) => {
    const getIndex = selectedTags_others.findIndex((s) => s === name);
    setST_others(selectedTags_others.filter((s, i) => i !== getIndex));
  };

  const [noteAmount, setNoteAmount] = useState(
    //화면 크기에 따른 초기 게시물 갯수
    isTabletOrMobile
      ? Math.ceil(
          (document.body.scrollHeight - 16 - convertRemToPixels(4)) /
            (16 + convertRemToPixels(10) + 16) +
            1
        ) || 4
      : Math.round(
          (document.body.scrollHeight - 16 - convertRemToPixels(4)) /
            (16 + convertRemToPixels(10) + 16) +
            1
        ) * 2 || 4
  );

  //? 노트 데이터 가져오기
  const [Notes, setNotes] = useState([]);
  const [expandTag, setET] = useState(false);

  async function fetchNotes(
    isNew,
    page,
    selectedTags_subject,
    selectedTags_others
  ) {
    axios
      .get(`${settings.api.domain}/api/event/getNotes/list`, {
        params: {
          page: page || 1,
          c: noteAmount,
          tags: [...selectedTags_subject, ...selectedTags_others] || [],
        },
        withCredentials: true,
      })
      .then((res) => {
        switch (res.data.status) {
          case "success":
            setLoading(false);
            if (isNew) {
              setNotes(res.data?.data);
            } else {
              if (Notes.length === 0) {
                setNotes(res.data?.data);
              } else {
                setNotes(Notes.concat(res.data?.data));
              }
            }

            if (res.data?.data.length > 0) {
              setPage(page + 1);
            }

            //좋아요 기록
            let likesObject = { ...Likes };
            res.data?.data.forEach((i) => {
              likesObject[i?.PostID] = i?.Likes;
            });

            setLikes(likesObject);
            break;

          default:
            alert("필기노트 목록을 불러오는 도중에 오류가 발생하였습니다.");
            setLoading(false);
            break;
        }
      });
  }

  //? 로딩
  const [isLoading, setLoading] = useState(true);

  //? 무한 스크롤 구현
  const [ref, inView] = useInView();

  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!isAuth) return;
    if (!inView) return;
    setLoading(true);
    fetchNotes(false, page, selectedTags_subject, selectedTags_others);
  }, [inView, isAuth]);

  //태그 바뀔 때마다 page 초기화하고 fetchNotes
  useEffect(() => {
    if (!isAuth) return;
    fetchNotes(true, 1, selectedTags_others, selectedTags_subject);
    setPage(1);
  }, [selectedTags_others, selectedTags_subject]);

  const [expandedImg, setExpandedImg] = useState({ open: false, url: null });

  //좋아요
  const [Likes, setLikes] = useState({});

  const handleFavorite = (n) => {
    axios
      .get(`${settings.api.domain}/api/handlefavorites`, {
        params: { uid: n?.UserID, pid: n?.PostID, table: "event_notes" },
        withCredentials: true,
      })
      .then((res) => {
        switch (res.data.status) {
          case "error":
            console.log("오류: " + res.data.message);
            break;
          case "success":
            if (res.data.action === "add") {
              if (Likes[n?.PostID] === undefined) {
                setLikes({ ...Likes, [n?.PostID]: n?.Likes + 1 });
              } else {
                setLikes({ ...Likes, [n?.PostID]: Likes[n?.PostID] + 1 });
              }
            } else if (res.data.action === "remove") {
              if (Likes[n?.PostID] === undefined) {
                setLikes({ ...Likes, [n?.PostID]: n?.Likes - 1 });
              } else {
                setLikes({ ...Likes, [n?.PostID]: Likes[n?.PostID] - 1 });
              }
            }
            break;
          default:
            console.log(res.data.message);
            break;
        }
      });
  };

  //게시물 삭제
  const deletePost = (n) => {
    if (window.confirm("이 게시물을 정말 삭제하시겠습니까?")) {
      axios
        .delete(`${settings.api.domain}/api/deletePost`, {
          params: { table: "event_notes", uid: n?.UserID, pid: n?.PostID },
          withCredentials: true,
        })
        .then((res) => {
          switch (res.data.status) {
            case "success":
              window.location.replace("/time/event/notes");
              break;

            default:
              console.log(res.data.message);
              alert("게시물 삭제 중 오류가 발생하였습니다.");
              break;
          }
        });
    }
  };

  return (
    <>
      <Navbar type="menu" name={props?.name} />
      <div className="wrapper top">
        {isAuth && (
          <>
            <div className="content community">
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Card
                    elevation={2}
                    sx={{
                      borderRadius: "var(--event-box-radius)",
                      overflow: "initial",
                      boxShadow: "none",
                    }}
                    className={styles.eventImgCard}
                  >
                    {eventImg && <img src={eventImg} alt="" />}
                  </Card>
                </Grid>
                {/* 태그 리스트 */}
                <Grid item xs={12}>
                  <Card
                    className={styles.tagsWrapper}
                    elevation={2}
                    sx={{ borderRadius: "var(--event-box-radius)" }}
                  >
                    <span
                      className={styles.tagsTitle}
                      onClick={() => setET(!expandTag)}
                    >
                      태그 목록
                      {expandTag ? <ExpandLess /> : <ExpandMore />}
                    </span>

                    <Collapse in={expandTag} unmountOnExit>
                      <div className={styles.tagsList}>
                        {/* 과목 태그 */}
                        {tags_subject[grade - 1]?.map((t, i) => (
                          <span
                            key={i}
                            className={styles.tag}
                            onClick={() => AddTag_subject(grade, i)}
                          >
                            {t}
                          </span>
                        ))}
                        {/* 기타 태그 */}
                        {tags_others?.map((t, i) => (
                          <span
                            key={i}
                            className={styles.tag}
                            onClick={() => AddTag_others(i)}
                            style={{ background: "var(--others-tag-color)" }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </Collapse>
                    {/* 선택한 태그 */}
                    {(selectedTags_subject?.length > 0 ||
                      selectedTags_others?.length > 0) && (
                      <>
                        <Divider sx={{ width: "100%", margin: "8px 0 0 0" }} />
                        <Card
                          className={styles.selectedTagsWrapper}
                          elevation={0}
                        >
                          {selectedTags_subject?.map((s, i) => (
                            <span
                              key={i}
                              className={styles.tag}
                              onClick={() => deleteTag_subject(grade, s)}
                            >
                              {s}
                              <Delete
                                fontSize="inherit"
                                sx={{ color: "#ff4569" }}
                              />
                            </span>
                          ))}
                          {selectedTags_others?.map((s, i) => (
                            <span
                              key={i}
                              className={styles.tag}
                              onClick={() => deleteTag_others(s)}
                              style={{ background: "var(--others-tag-color)" }}
                            >
                              {s}
                              <Delete
                                fontSize="inherit"
                                sx={{ color: "#ff4569" }}
                              />
                            </span>
                          ))}
                        </Card>
                      </>
                    )}
                  </Card>
                </Grid>

                {/* 필기 리스트 */}
                {Notes.length > 0 &&
                  Notes?.map((n, i) => (
                    <Grid item xs={12} key={i}>
                      <Card
                        className={styles.NotesWrapper}
                        elevation={2}
                        sx={{
                          borderRadius: "var(--event-box-radius)",
                          padding: "4px 16px 0 0",
                        }}
                      >
                        <div className={styles.NotesHeader}>
                          <span>
                            <img
                              src={n?.AvatarURL}
                              alt=""
                              className={styles.NotesAvatar}
                            />
                            {n?.UserID} {n?.Username}
                            {n?.UserID === userData.userID && (
                              <span
                                style={{
                                  color: "var(--highlight-user)",
                                  marginLeft: "0.5rem",
                                }}
                              >
                                나
                              </span>
                            )}
                          </span>
                          <span>
                            {n?.UserID === userData.userID && (
                              <span
                                onClick={() => deletePost(n)}
                                className={styles.deletePost}
                              >
                                삭제
                              </span>
                            )}
                            {elapsedTime(n?.Date)}
                          </span>
                        </div>

                        <div className={styles.NotesTitle}>
                          <span>{n?.Title}</span>
                        </div>

                        <div className={styles.NotesTags}>
                          {n?.UserID && (
                            <span
                              className={`${
                                styles[
                                  String(n?.UserID).slice(0, 1) === "1"
                                    ? "first"
                                    : String(n?.UserID).slice(0, 1) === "2"
                                    ? "second"
                                    : "third"
                                ]
                              } ${styles.tag}`}
                              style={{ pointerEvents: "none" }}
                            >
                              고{String(n?.UserID).slice(0, 1)}
                            </span>
                          )}

                          {JSON.parse(n?.Tags)?.map((t, i) => (
                            <span
                              className={styles.tag}
                              key={t + i}
                              style={{ pointerEvents: "none" }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>

                        <div className={styles.NotesPreview}>
                          <Slider
                            infinite={false}
                            accessibility
                            dots
                            arrows={false}
                            lazyLoad
                            slidesToShow={2}
                            // rows={JSON.parse(n?.Images)?.length > 2 ? 2 : 1}
                          >
                            {n?.Images &&
                              JSON.parse(n?.Images)?.map((img, index) => (
                                <div key={index + img}>
                                  <img
                                    src={img}
                                    alt=""
                                    className={styles.NotesImg}
                                    onClick={() => {
                                      setExpandedImg({
                                        open: !expandedImg.open,
                                        url: img,
                                      });
                                      document.querySelector(
                                        "html"
                                      ).style.overflow = "hidden";
                                    }}
                                  />
                                </div>
                              ))}
                          </Slider>
                        </div>

                        <TransformWrapper initialScale={1}>
                          {({ resetTransform }) => (
                            <TransformComponent
                              wrapperStyle={{
                                display: expandedImg.open ? "block" : "none",
                                position: "fixed",
                                top: "0",
                                left: "0",
                                height: "100%",
                                width: "100%",
                                background: "rgba(0, 0, 0, 0.5)",
                                zIndex: 99999,
                              }}
                              contentStyle={{
                                display: expandedImg.open ? "block" : "none",
                                position: "fixed",
                                top: "0",
                                left: "0",
                                height: "100%",
                                width: "100%",
                                background: "rgba(0, 0, 0, 0)",
                              }}
                            >
                              <img
                                src={expandedImg.url}
                                alt=""
                                onClick={() => {
                                  resetTransform();
                                  setExpandedImg({
                                    open: !expandedImg.open,
                                    url: null,
                                  });
                                  document.querySelector(
                                    "html"
                                  ).style.overflow = "";
                                }}
                                className={styles.expandedImg}
                                style={{ pointerEvents: "initial" }}
                              />
                            </TransformComponent>
                          )}
                        </TransformWrapper>

                        <div className={styles.NotesUtils}>
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              flexDirection: "row",
                              flexWrap: "nowrap",
                              color: "#555555",
                            }}
                          >
                            {Likes[n?.PostID] > n?.Likes ? (
                              <IconButton onClick={() => handleFavorite(n)}>
                                <Favorite
                                  sx={{
                                    color: "rgb(255, 26, 63)",
                                  }}
                                  fontSize="small"
                                />
                              </IconButton>
                            ) : Likes[n?.PostID] === n?.Likes &&
                              n?.who_liked ? (
                              <IconButton onClick={() => handleFavorite(n)}>
                                <Favorite
                                  sx={{
                                    color: "rgb(255, 26, 63)",
                                  }}
                                  fontSize="small"
                                />
                              </IconButton>
                            ) : (
                              <IconButton onClick={() => handleFavorite(n)}>
                                <FavoriteBorder fontSize="small" />
                              </IconButton>
                            )}
                            {Likes[n?.PostID]}
                          </span>
                        </div>
                      </Card>
                    </Grid>
                  ))}
                <div className={styles.loading}>
                  {isLoading && (
                    <CircularProgress disableShrink sx={{ margin: "0 auto" }} />
                  )}
                </div>
                {!isLoading &&
                  Notes !== null &&
                  Notes?.at(-1) === undefined && (
                    <Grid item xs={12} sx={{ textAlign: "center" }}>
                      <span>게시물이 없습니다.</span>
                    </Grid>
                  )}
              </Grid>
              <div ref={ref} style={{ position: "absolute", bottom: 0 }}></div>
              {/* 플로팅 버튼 */}
              <Link to={`/time/event/notes/new`}>
                <Fab
                  color="primary"
                  sx={{ position: "fixed", right: "24px", bottom: "24px" }}
                >
                  <FileUploadRounded />
                </Fab>
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}

import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import settings from "../../../settings";
import styles from "./ForestMore.module.css";

import {
  ArrowCircleRight,
  AttachFile,
  ChevronLeft,
  ChevronRight,
  ExpandLess,
  ExpandMore,
  Favorite,
  FavoriteBorder,
} from "@mui/icons-material";

import {
  Card,
  Collapse,
  Divider,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import { checkSession } from "../../Modules/Authorization/checkSession";
import { switchSessionResult } from "../../Modules/Authorization/sessionSwitches";
import { maxLengthCheck } from "../../Modules/maxLengthCheck";

import { saveAs } from "file-saver";
import { elapsedTime } from "../../Modules/elapsedTime";
import Navbar from "../../Modules/Navbar/Navbar";
import { Tags } from "./Tags";

export default function ForestMore(props) {
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

  const { tag, uid, pid } = useParams();

  const [postData, setPostData] = useState([]);
  const [avatarURL, setAvatarURL] = useState(null);
  const [Likes, setLikes] = useState(null);
  const [comments, setComments] = useState(null);

  const [commentAnimationStyle, setCAS] = useState({ maxHeight: "3rem" });
  const [newComment, setNC] = useState(null);
  const [addButton, showAddButton] = useState(false);

  useEffect(() => {
    if (!isAuth) return;

    //의견 데이터
    axios
      .get(`${settings.api.domain}/api/getPost`, {
        params: { table: tag, uid: uid, pid: pid },
        withCredentials: true,
      })
      .then((res) => {
        switch (res.data.status) {
          case "success":
            setPostData(res.data.data[0]);
            setLikes(res.data.data[0].Likes);
            break;
          default:
            setPostData([]);
            alert(res.data.message);
            window.history.go(-1);
            break;
        }
      })
      .catch((err) => {
        if (err) return console.log(err);
      });

    //프로필사진
    axios
      .get(`${settings.api.domain}/api/getAvatarURL`, {
        params: { userID: uid },
      })
      .then((res) => {
        setAvatarURL(res.data.url);
      });
  }, [isAuth]);

  const fetchComments = postData?.Comments
    ? JSON.parse(postData?.Comments) || []
    : [];

  const inputRef = useRef(null);

  function sendComment(comment) {
    if (comment.trim().length === 0) return;

    const commentData = {
      table: tag,
      postID: postData?.PostID,
      postUserID: postData?.UserID,
      comment: String(comment),
    };

    axios
      .post(`${settings.api.domain}/api/sendComment`, commentData, {
        withCredentials: true,
      })
      .then((res) => {
        switch (res.data.status) {
          case "error":
            alert("댓글 등록 중 오류가 발생하였습니다.");
            break;

          case "success":
            setNC(null);
            showAddButton(false);
            setCAS({
              maxHeight: "3rem",
              paddingTop:
                document.activeElement === inputRef.current ? "1rem" : 0,
            });

            //데이터 갱신
            axios
              .get(`${settings.api.domain}/api/getPost`, {
                params: { table: tag, uid: uid, pid: pid },
                withCredentials: true,
              })
              .then((res) => {
                setPostData(res.data.data[0]);
              })
              .catch((err) => {
                if (err) return console.log(err);
              });
            break;

          default:
            alert("오류가 발생하였습니다. " + res.data.message);
            break;
        }
      })
      .catch((err) => {
        alert("댓글 등록 중 오류가 발생하였습니다. " + err.message);
        console.log(err);
      });
  }

  const [isFavorite, setFavorite] = useState(null);

  useEffect(() => {
    if (!isAuth) return;
    axios
      .get(`${settings.api.domain}/api/getfavorites`, {
        params: {
          table: tag,
          userID: userData.userID,
          username: userData.username,
        },
      })
      .then((res) => {
        switch (res.data.status) {
          case "success":
            const list = res.data?.list?.filter(
              (f) => f.PostID === parseInt(pid) && f.UserID === parseInt(uid)
            );
            setFavorite(list[0]?.favorite || false);
            break;
          default:
            console.log(res.data.message);
            break;
        }
      });
  }, [isAuth]);

  const handleFavorite = () => {
    axios
      .get(`${settings.api.domain}/api/handlefavorites`, {
        params: {
          uid: uid,
          pid: pid,
          table: tag,
        },
        withCredentials: true,
      })
      .then((res) => {
        switch (res.data.status) {
          case "error":
            console.log("오류: " + res.data.message);
            break;
          case "success":
            setFavorite(res.data.favorite);
            if (res.data.action === "add") {
              setLikes(Likes + 1);
            } else if (res.data.action === "remove") {
              setLikes(Likes - 1);
            }
            break;
          default:
            console.log(res.data.message);
            break;
        }
      });
  };

  const deleteComment = (cid) => {
    if (!window.confirm("이 댓글을 삭제하시겠습니까?")) return;

    axios
      .delete(`${settings.api.domain}/api/deleteComment`, {
        params: {
          table: tag,
          uid: uid,
          pid: pid,
          commentID: cid,
        },
        withCredentials: true,
      })
      .then((res) => {
        switch (res.data.status) {
          case "success":
            //데이터 갱신
            axios
              .get(`${settings.api.domain}/api/getPost`, {
                params: { table: tag, uid: uid, pid: pid },
                withCredentials: true,
              })
              .then((res) => {
                setPostData(res.data.data[0]);
              })
              .catch((err) => {
                if (err) return console.log(err);
              });

            alert(res.data.message);
            break;

          default:
            alert(
              "댓글을 삭제하는 도중에 오류가 발생하였습니다. " +
                res.data.message
            );
            break;
        }
      });
  };

  //의견 삭제
  const deletePost = () => {
    if (window.confirm("이 의견을 정말 삭제하시겠습니까?")) {
      axios
        .delete(`${settings.api.domain}/api/deletePost`, {
          params: { table: tag, uid: uid, pid: pid },
          withCredentials: true,
        })
        .then((res) => {
          switch (res.data.status) {
            case "success":
              window.location.replace("/forest");
              break;

            default:
              console.log(res.data.message);
              alert("의견 삭제 중 오류가 발생하였습니다.");
              break;
          }
        });
    }
  };

  //slider
  const PrevArrow = ({ onClick }) => (
    <div className={styles.slideController} style={{ left: 0 }}>
      <IconButton onClick={onClick} disableRipple>
        <ChevronLeft />
      </IconButton>
    </div>
  );

  const NextArrow = ({ onClick }) => (
    <div className={styles.slideController} style={{ right: 0 }}>
      <IconButton onClick={onClick} disableRipple>
        <ChevronRight />
      </IconButton>
    </div>
  );

  const [expandedImg, setExpandedImg] = useState({ open: false, url: null });

  const DownloadImg = (url) => {
    saveAs(url, url.split("/").at(-1));
  };

  const [collapse, setCollapse] = useState(false);

  return (
    <>
      <Navbar type="back" name={Tags.get(tag) || props?.name || ""} />
      <div className="wrapper top">
        <div className="content post">
          <Card className={styles.contents}>
            <div className={styles.userinfo}>
              <div>
                <img className={styles.AvatarIcon} src={avatarURL} alt="" />
                <span>
                  {postData.UserID} {postData.Username}
                  {postData.UserID === userData.userID && (
                    <span style={{ color: "var(--highlight-user)" }}> 나</span>
                  )}
                </span>
              </div>
              <span className={styles.deletePost} onClick={() => deletePost()}>
                삭제
              </span>
            </div>

            <h2 className={styles.title}>{postData.Title}</h2>
            <div className={styles.postContent}>
              <pre>{postData.Content}</pre>

              {postData?.Images && (
                <>
                  <div className={styles.images}>
                    <Slider
                      infinite={false}
                      accessibility
                      dots
                      arrows={true}
                      prevArrow={<PrevArrow />}
                      nextArrow={<NextArrow />}
                      adaptiveHeights
                    >
                      {JSON.parse(postData?.Images).map((i) => (
                        <div key={i}>
                          <img
                            className={styles.sliderImg}
                            src={i}
                            alt=""
                            onClick={() => {
                              setExpandedImg({
                                open: !expandedImg.open,
                                url: i,
                              });
                              document.querySelector("html").style.overflow =
                                "hidden";
                            }}
                          />
                        </div>
                      ))}
                    </Slider>
                  </div>
                  <div
                    className={styles.showImg}
                    style={{ display: expandedImg.open ? "block" : "none" }}
                  >
                    <img
                      src={expandedImg.url}
                      alt=""
                      onClick={() => {
                        setExpandedImg({ open: !expandedImg.open, url: null });
                        document.querySelector("html").style.overflow = "";
                      }}
                    />
                  </div>
                </>
              )}

              {postData?.Images && JSON.parse(postData?.Images).length > 0 && (
                <>
                  <div className={styles.attachedFiles}>
                    <Typography
                      onClick={() => {
                        setCollapse(!collapse);
                      }}
                      fontSize="small"
                      fontWeight={400}
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        flexWrap: "nowrap",
                      }}
                    >
                      첨부파일
                      {collapse ? <ExpandLess /> : <ExpandMore />}
                    </Typography>
                    <Collapse in={collapse} unmountOnExit>
                      {JSON.parse(postData?.Images).map((i) => (
                        <Typography
                          className={styles.dlImg_text}
                          component="a"
                          key={i}
                          fontSize="small"
                          color="gray"
                        >
                          <AttachFile fontSize="small" />
                          <span
                            onClick={() => {
                              DownloadImg(i);
                            }}
                          >
                            {i.split("/").at(-1)}
                          </span>
                        </Typography>
                      ))}
                    </Collapse>
                  </div>
                </>
              )}
            </div>
            <div
              className={styles.infobox}
              style={{
                color: localStorage.getItem("theme") === "dark" ? "#fff" : null,
              }}
            >
              <div className={styles.utils}>
                <IconButton
                  onClick={() => {
                    handleFavorite();
                  }}
                >
                  {isFavorite ? (
                    <Favorite
                      sx={{ color: "rgb(255, 26, 63)" }}
                      fontSize="small"
                    />
                  ) : (
                    <FavoriteBorder fontSize="small" />
                  )}
                </IconButton>
                <span>{Likes}</span>
              </div>
              <div className={styles.date}>
                <span>{elapsedTime(postData.Date)}</span>
              </div>
            </div>
          </Card>
          <br />
          <Card className={styles.comments}>
            <span style={{ display: "block", margin: 0 }}>
              댓글 {postData.total_comments}
            </span>
            {postData &&
              fetchComments.length > 0 &&
              fetchComments?.map((c) => {
                return (
                  <div key={c.userID + c.Date + Math.random()}>
                    <div className={styles.commentCard}>
                      <div className={styles.commentUser}>
                        <div
                          className={styles.userinfo}
                          style={{
                            color: "#555555",
                            fontSize: "0.9rem",
                            paddingTop: "1rem",
                            justifyContent: "flex-start",
                          }}
                        >
                          <img
                            className={styles.AvatarIcon}
                            src={c.AvatarURL}
                            alt=""
                          />
                          <span
                            style={{
                              color:
                                localStorage.getItem("theme") === "dark"
                                  ? "#fff"
                                  : "#000",
                            }}
                          >
                            {c.userID} {c.username}
                            {c.userID === userData.userID && (
                              <span style={{ color: "var(--highlight-user)" }}>
                                {" "}
                                나
                              </span>
                            )}
                          </span>
                          {c.userID === userData.userID &&
                            c.username === userData.username && (
                              <span
                                className={styles.deleteComment}
                                onClick={() => deleteComment(c?.commentID)}
                              >
                                삭제
                              </span>
                            )}
                        </div>
                        <div className={styles.commentDate}>
                          <span>{elapsedTime(c.Date)}</span>
                        </div>
                        <div className={styles.commentContent}>{c.comment}</div>
                      </div>
                    </div>
                    <Divider />
                  </div>
                );
              })}
          </Card>
          <Card className={styles.newCommentCard} style={commentAnimationStyle}>
            <TextField
              inputRef={inputRef}
              label="댓글 작성하기"
              variant="standard"
              placeholder="여기에 댓글을 입력하세요."
              fullWidth
              value={newComment || ""}
              onFocus={() => {
                if (newComment?.length > 0) {
                  showAddButton(true);
                }
                setCAS({
                  maxHeight: "6rem",
                  paddingBottom: "2rem",
                  paddingTop: "1rem",
                });
              }}
              onBlur={() => {
                setCAS({
                  maxHeight: "3rem",
                  paddingTop: newComment?.length > 0 ? "1rem" : 0,
                });
                if (newComment?.length < 1) {
                  showAddButton(false);
                }
              }}
              onChange={(e) => {
                if (e.target.value.length > 0) {
                  showAddButton(true);
                } else {
                  showAddButton(false);
                }
                maxLengthCheck(e, null, 250);
                setNC(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.target.value.length > 0 && e.key === "Enter") {
                  sendComment(newComment);
                }
              }}
            />
            {addButton && (
              <IconButton onClick={() => sendComment(newComment)}>
                <ArrowCircleRight color="info" />
              </IconButton>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}

import { useMediaQuery } from "react-responsive";
import { MediaQuery } from "../../Modules/MediaQuery";
import styles from "./Forest.module.css";

import CommentIcon from "@mui/icons-material/Comment";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { Card, CircularProgress, Fab, Grid } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import settings from "../../../settings";
import { Tags } from "./Tags";

import SearchIcon from "@mui/icons-material/Search";
import { Button, Menu, MenuItem } from "@mui/material";
import InputBase from "@mui/material/InputBase";
import { styled } from "@mui/material/styles";

import { Edit } from "@mui/icons-material";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router-dom";
import { checkSession } from "../../Modules/Authorization/checkSession";
import { switchSessionResult } from "../../Modules/Authorization/sessionSwitches";
import convertRemToPixels from "../../Modules/convertRemToPixels";
import { elapsedTime } from "../../Modules/elapsedTime";
import Navbar from "../../Modules/Navbar/Navbar";
import { SortBy } from "./SortBy";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  marginLeft: theme.spacing(1),
  width: "auto",
  height: "2rem",
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginLeft: "8px",
  transition: theme.transitions.create("width"),
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: theme.spacing(4),
    marginLeft: "8px",
    transition: theme.transitions.create("width"),
    height: "1rem",
    width: "0",
    "&:focus": {
      width: "6rem",
      borderBottom: "1px solid #cccccc",
    },
  },
}));

export default function Forest(props) {
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

  //responsive : Mobile
  const isTabletOrMobile = useMediaQuery({
    query: MediaQuery("Mobile"),
  });

  const [ref, inView] = useInView();

  const [postAmount, setPostAmount] = useState(
    //화면 크기에 따른 초기 의견 갯수
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

  const [lastPosition, setLastPosition] = useState(-postAmount);

  async function fetchPosts(table, orderBy, searchContent, isNew) {
    if (isNew) {
      setLastPosition(-postAmount);
    }

    await axios
      .get(`${settings.api.domain}/api/getTableList`, {
        params: {
          table: table || Tag,
          c: postAmount,
          lastPosition: isNew ? -postAmount : lastPosition,
          orderBy: orderBy || null,
          query: searchContent || null,
        },
        withCredentials: true,
      })
      .then((res) => {
        switch (res.data.status) {
          case "success":
            setLoading(false);

            //의견 없음
            if (res.data?.data.length < 1) {
              return isNew
                ? setForestList([])
                : setForestList(forestList?.concat([]));
            }

            if (isNew) {
              setForestList(res.data.data);

              setLastPosition(parseInt(-postAmount) + parseInt(postAmount));
            } else {
              lastPosition === -postAmount
                ? setForestList(res.data.data)
                : setForestList(forestList.concat(res.data.data));
              setLastPosition(parseInt(lastPosition) + parseInt(postAmount));
            }
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
      })
      .catch((err) => {
        if (err) return console.log(err);
      });
  }

  const [orderBy, setOrderBy] = useState(null);
  const [searchContent, setSearchContent] = useState(null);

  useEffect(() => {
    if (!isAuth) return;

    if (!inView) return;
    setLoading(true);
    fetchPosts(null, orderBy, searchContent, false);
  }, [inView, isAuth]);

  const [forestList, setForestList] = useState(null);
  const [isLoading, setLoading] = useState(true);

  //정렬 버튼
  const [anchorEl_sort, setAnchorEl_sort] = useState(null);
  const open_sort = Boolean(anchorEl_sort);

  const handleSort = (event) => {
    setAnchorEl_sort(event.currentTarget);
  };

  const handleSortClose = () => {
    setAnchorEl_sort(null);
  };

  //주제 버튼
  const [anchorEl_tag, setAnchorEl_tag] = useState(null);
  const open_tag = Boolean(anchorEl_tag);

  const [Tag, setTag] = useState("all");

  const handleTag = (event) => {
    setAnchorEl_tag(event.currentTarget);
  };

  const handleTagClose = () => {
    setAnchorEl_tag(null);
  };

  const CardStyle = {
    minHeight: "10rem",
    display: "flex",
    padding: "4px 16px 4px 16px",
    boxShadow: "var(--paper-shadow)",
    borderRadius: "var(--paper-radius)",
    flexDirection: "column",
    justifyContent: "space-between",
    background:
      localStorage.getItem("theme") === "dark"
        ? "rgba(255, 255, 255, 0.12)"
        : "#fff",
  };

  const menuBtnStyle = {
    color: "black",
    minWidth: "2rem",
    maxHeight: "2rem",
    boxShadow: "var(--list-box-shadow)",
  };

  return (
    <>
      <Navbar type="menu" name={props?.name} />
      <div className="wrapper top">
        {isAuth && (
          <>
            <div className="content community">
              {/* <div className={styles.guideline}>가이드라인(이미지)</div> */}

              {/* 툴바 */}
              <div className={styles.selectedOptions}>
                <span className={`${styles.tags} ${styles[Tag]}`}>
                  {Tags.get(Tag)}
                </span>
                {orderBy && (
                  <span
                    className={`${styles.tags} ${styles.SortBy}`}
                    style={{
                      marginLeft: Tags.get(Tag) === "all" ? null : "4px",
                    }}
                  >
                    {SortBy.get(orderBy)}
                  </span>
                )}
              </div>
              <div className={styles.toolbar}>
                <div>
                  <Button
                    id="tag-button"
                    sx={menuBtnStyle}
                    aria-controls={open_sort ? "sort-menu" : undefined}
                    aria-haspopup="true"
                    aria-expanded={open_sort ? "true" : undefined}
                    onClick={handleTag}
                    disableTouchRipple
                    style={{
                      color: "#ffffff",
                      background: "var(--forest-tag-color)",
                    }}
                  >
                    주제
                  </Button>
                  <Menu
                    id="tag-menu"
                    anchorEl={anchorEl_tag}
                    open={open_tag}
                    onClose={handleTagClose}
                    MenuListProps={{
                      "aria-labelledby": "tag-button",
                    }}
                  >
                    <MenuItem
                      onClick={() => {
                        handleTagClose();
                        setTag("all");
                        fetchPosts("all", orderBy, searchContent, true);
                      }}
                    >
                      전체
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleTagClose();
                        setTag("s1");
                        fetchPosts("s1", orderBy, searchContent, true);
                      }}
                    >
                      {Tags.get("s1")}
                    </MenuItem>
                  </Menu>
                  <Button
                    sx={{
                      ...menuBtnStyle,
                      marginLeft: "8px",
                      background:
                        localStorage.getItem("theme") === "dark"
                          ? "rgba(255, 255, 255, 0.12) !important"
                          : "#fff",
                      color:
                        localStorage.getItem("theme") === "dark"
                          ? "#fff"
                          : "#000",
                    }}
                    id="sort-button"
                    aria-controls={open_sort ? "sort-menu" : undefined}
                    aria-haspopup="true"
                    aria-expanded={open_sort ? "true" : undefined}
                    onClick={handleSort}
                    disableTouchRipple
                  >
                    정렬
                  </Button>
                  <Menu
                    id="sort-menu"
                    anchorEl={anchorEl_sort}
                    open={open_sort}
                    onClose={handleSortClose}
                    MenuListProps={{
                      "aria-labelledby": "sort-button",
                    }}
                  >
                    <MenuItem
                      onClick={() => {
                        handleSortClose();
                        setOrderBy("latest");
                        fetchPosts(null, "latest", searchContent, true);
                      }}
                    >
                      {SortBy.get("latest")}
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleSortClose();
                        setOrderBy("oldest");
                        fetchPosts(null, "oldest", searchContent, true);
                      }}
                    >
                      {SortBy.get("oldest")}
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleSortClose();
                        setOrderBy("popular");
                        fetchPosts(null, "popular", searchContent, true);
                      }}
                    >
                      {SortBy.get("popular")}
                    </MenuItem>
                  </Menu>
                </div>

                <Search>
                  <SearchIconWrapper>
                    <SearchIcon
                      color={searchContent?.length > 0 ? "info" : "inherit"}
                    />
                  </SearchIconWrapper>
                  <StyledInputBase
                    placeholder="검색"
                    inputProps={{ "aria-label": "search" }}
                    onChange={(e) => {
                      let searchQuery = e.target.value.toString();
                      setTimeout(() => {
                        if (searchQuery === e.target.value.toString()) {
                          setSearchContent(e.target.value.toString());
                          fetchPosts(
                            null,
                            orderBy,
                            e.target.value.toString(),
                            true
                          );
                        }
                      }, 300);
                    }}
                  />
                </Search>
              </div>
              <br />
              {/* 의견 */}
              <div className={styles.container}>
                <Grid container spacing={2}>
                  {forestList && (
                    <>
                      {forestList?.map((l) => {
                        return (
                          <Grid
                            item
                            xs={isTabletOrMobile ? 12 : 6}
                            key={`${l?.Tags}/${l?.PostID}/${l?.UserID}`}
                          >
                            <Link
                              to={`/forest/${l?.Tags}/${l?.UserID}/${l?.PostID}`}
                            >
                              <Card
                                elevation={0}
                                sx={CardStyle}
                                className={styles.listbox}
                              >
                                <div className={styles.postbox}>
                                  <div className={styles.header}>
                                    <img
                                      src={l?.AvatarURL}
                                      className={styles.avatarImg}
                                      alt=""
                                    ></img>
                                    <div className={styles.username}>
                                      {l?.UserID} {l?.Username}
                                    </div>
                                  </div>
                                  <span className={`${styles.tags}`}>
                                    {Tags.get(l?.Tags)}
                                  </span>
                                  <span className={styles.content}>
                                    {l?.Content}
                                  </span>
                                </div>
                                <div
                                  className={styles.infobox}
                                  style={{
                                    color:
                                      localStorage.getItem("theme") === "dark"
                                        ? "#fff"
                                        : "var(--color-disabled)",
                                  }}
                                >
                                  <div className={styles.utils}>
                                    {l?.who_liked ? (
                                      <FavoriteIcon
                                        sx={{
                                          marginRight: "4px",
                                        }}
                                        fontSize="small"
                                      />
                                    ) : (
                                      <FavoriteBorderIcon
                                        sx={{
                                          marginRight: "4px",
                                        }}
                                        fontSize="small"
                                      />
                                    )}

                                    <span>{l?.Likes}</span>
                                    <CommentIcon
                                      sx={{
                                        marginLeft: "4px",
                                        marginRight: "4px",
                                        display: "flex",
                                      }}
                                      fontSize="small"
                                    />
                                    <span>{l?.total_comments}</span>
                                  </div>
                                  <div className={styles.date}>
                                    <span>{elapsedTime(l?.Date)}</span>
                                  </div>
                                </div>
                              </Card>
                            </Link>
                          </Grid>
                        );
                      })}
                    </>
                  )}
                  <div className={styles.loading}>
                    {isLoading && (
                      <CircularProgress
                        disableShrink
                        sx={{ margin: "0 auto" }}
                      />
                    )}
                  </div>
                  {!isLoading &&
                    forestList !== null &&
                    forestList?.at(-1) === undefined && (
                      <Grid item xs={12} sx={{ textAlign: "center" }}>
                        <span>의견이 없습니다.</span>
                      </Grid>
                    )}
                </Grid>
                <div
                  ref={ref}
                  style={{ position: "absolute", bottom: 0 }}
                ></div>
              </div>
              {/* 플로팅 버튼 */}
              <Link to={`/forest/new#${Tag}`}>
                <Fab
                  color="primary"
                  sx={{ position: "fixed", right: "24px", bottom: "24px" }}
                >
                  <Edit />
                </Fab>
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}

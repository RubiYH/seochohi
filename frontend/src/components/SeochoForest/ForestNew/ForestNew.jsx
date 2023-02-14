import {
  Box,
  Button,
  Fade,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import settings from "../../../settings";
import { checkSession } from "../../Modules/Authorization/checkSession";
import { switchSessionResult } from "../../Modules/Authorization/sessionSwitches";
import { maxLengthCheck } from "../../Modules/maxLengthCheck";
import { MediaQuery } from "../../Modules/MediaQuery";
import styles from "./ForestNew.module.css";

import { Add, Delete } from "@mui/icons-material";
import ImageUploading from "react-images-uploading";
import Navbar from "../../Modules/Navbar/Navbar";
import { HandleResponse } from "../../Modules/ResponseCode";
import { Tags } from "../Forest/Tags";
import BeforePost from "./ForestBeforePost";

export default function ForestNew(props) {
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

  //responsive : Mobile
  const isTabletOrMobile = useMediaQuery({
    query: MediaQuery("Mobile"),
  });

  const [category, setCategory] = useState("");

  const [title, setTitle] = useState(null);
  const [content, setContent] = useState(null);
  const [images, setImages] = useState([]);

  //upload images

  const onImageChange = (imageList, addUpdateIndex) => {
    // data for submit
    setImages(imageList);
  };

  const maxFileSize = settings.maxImageSize;

  const checkLength = (e, min, max, callback) => {
    maxLengthCheck(e, min, max, callback).then((r) => {
      switch (e.target.id) {
        case "title":
          setTitleError({ status: r.status, message: r.message });
          break;
        case "content":
          setContentError({ status: r.status, message: r.message });
          break;
        default:
          break;
      }
    });
  };

  const [errorTitle, setTitleError] = useState({
    status: false,
    message: null,
  });
  const [errorContent, setContentError] = useState({
    status: false,
    message: null,
  });

  const [open, setOpen] = useState(false);
  const [canSubmit, setCanSubmit] = useState(true);

  const handleSubmit = (e) => {
    e?.preventDefault();
    setOpen(false);

    if (category.length < 1) {
      alert("주제를 선택하세요.");
      setCanSubmit(true);
      return;
    } else if (content === null) {
      alert("내용을 입력하세요.");
      setCanSubmit(true);
      return;
    }

    const postData = {
      category: category,
      content: content,
      images: images,
    };

    axios
      .post(`${settings.api.domain}/api/forest/post`, postData, {
        withCredentials: true,
      })
      .then((res) => {
        switch (res.data.status) {
          case "error":
            alert(res.data.message);
            break;
          case "success":
            alert(res.data.message);
            window.location.replace(`/forest`);
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
      .catch((e) => {
        HandleResponse(e);
      });
  };

  return (
    <>
      <Navbar type="back" name={props?.name} />
      <div className="wrapper top">
        <div className="content">
          <Box
            sx={{
              width: "100%",
              height: "100%",
              position: "relative",
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
            }}
            component="form"
            noValidate={false}
            onSubmit={handleSubmit}
            method="POST"
          >
            <span className={styles.title}>주제</span>
            <br />
            <FormControl>
              <InputLabel>주제 선택</InputLabel>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                label="주제 선택"
              >
                <MenuItem value="s1">{Tags.get("s1")}</MenuItem>
              </Select>
            </FormControl>{" "}
            <br />
            <span className={styles.title} style={{ marginBottom: "1rem" }}>
              의견 내용
            </span>
            <TextField
              multiline
              rows={10}
              placeholder="여기에 의견을 입력하세요."
              autoComplete="off"
              id="content"
              onChange={(e) => {
                checkLength(e, 10, 250, setContent);
              }}
              helperText={errorContent.message}
              error={errorContent.status}
              required
            />
            <br />
            <ImageUploading
              multiple
              value={images}
              onChange={onImageChange}
              maxNumber={10}
              dataURLKey="data_url"
              acceptType={["jpg", "jpeg", "png"]}
              maxFileSize={maxFileSize}
            >
              {({
                imageList,
                onImageUpload,
                onImageRemoveAll,
                onImageUpdate,
                onImageRemove,
                errors,
              }) => (
                <>
                  <span
                    className={styles.title}
                    style={{ flexDirection: "column" }}
                  >
                    <div
                      className={styles.title}
                      style={{ alignItems: "center" }}
                    >
                      이미지 업로드 (최대 10장)
                      <IconButton onClick={onImageUpload}>
                        <Add />
                      </IconButton>
                    </div>
                    <span style={{ fontSize: "0.7rem" }}>(png, jpg, jpeg)</span>
                  </span>
                  {errors && (
                    <div style={{ color: "#d32f2f" }}>
                      {errors.maxNumber && (
                        <span>
                          이미지는 최대 10장까지만 업로드할 수 있습니다.
                        </span>
                      )}
                      {errors.acceptType && (
                        <span>지원되지 않는 파일 형식입니다</span>
                      )}
                      {errors.maxFileSize && (
                        <span>
                          파일 크키가 너무 큽니다. (최대 {maxFileSize / 1000000}
                          MB)
                        </span>
                      )}
                    </div>
                  )}
                  <div className={styles.imageList}>
                    {imageList.map((image, index) => (
                      <div className={styles.imageArray_wrapper} key={index}>
                        <img
                          src={image["data_url"]}
                          alt=""
                          className={styles.imageArray}
                        />
                        <span>
                          {image["file"].name}
                          <IconButton onClick={() => onImageRemove(index)}>
                            <Delete />
                          </IconButton>
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </ImageUploading>
            <Button
              variant="contained"
              type="button"
              style={{ margin: "0 auto" }}
              onClick={() => setOpen(true)}
            >
              완료
            </Button>
          </Box>
        </div>
        <Modal open={open} onClose={() => setOpen(false)} closeAfterTransition>
          <Fade in={open}>
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
              <BeforePost
                canSubmit={(bool) => {
                  setCanSubmit(bool);
                }}
              />
              <Button
                variant="contained"
                type="button"
                disabled={canSubmit}
                style={{ marginTop: "1rem" }}
                onClick={() => handleSubmit()}
              >
                확인
              </Button>
            </Box>
          </Fade>
        </Modal>
      </div>
    </>
  );
}

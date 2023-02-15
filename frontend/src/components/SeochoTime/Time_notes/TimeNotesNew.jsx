import { Add, AddCircle, Delete } from "@mui/icons-material";
import {
  Box,
  Button,
  Checkbox,
  Fade,
  FormControlLabel,
  FormGroup,
  IconButton,
  Modal,
  TextField,
} from "@mui/material";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import ImageUploading from "react-images-uploading";
import settings from "../../../settings";
import { checkSession } from "../../Modules/Authorization/checkSession";
import { switchSessionResult } from "../../Modules/Authorization/sessionSwitches";
import { maxLengthCheck } from "../../Modules/maxLengthCheck";
import Navbar from "../../Modules/Navbar/Navbar";
import { HandleResponse } from "../../Modules/ResponseCode";
import { tags_others, tags_subject } from "./tags";
import BeforePost from "./TimeNotesBeforePost";
import styles from "./TimeNotesNew.module.css";

export default function TimeNotesNew(props) {
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

  const [title, setTitle] = useState(null);
  const [images, setImages] = useState([]);

  //upload images

  const onImageChange = (imageList) => {
    // data for submit
    setImages(imageList);
  };

  const maxFileSize = 10 * 1000000; //10mb

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

  const [grade, setGrade] = useState(null);

  useEffect(() => {
    setGrade(String(userData.userID).charAt(0));
  }, [userData.userID]);

  //과목 태그
  const [selectedTags_subject, setST_subject] = useState([]);

  const AddTag_subject = (grade, index) => {
    if (selectedTags_subject.some((s) => s === tags_subject[grade - 1][index])) return;
    setST_subject([...selectedTags_subject, tags_subject[grade - 1][index]]);
  };

  const deleteTag_subject = (grade, index) => {
    const getIndex = selectedTags_subject.findIndex((s) => s === tags_subject[grade - 1][index]);
    setST_subject(selectedTags_subject.filter((s, i) => i !== getIndex));
  };

  //기타 태그
  const [selectedTags_others, setST_others] = useState([]);

  const AddTag_others = (index) => {
    if (selectedTags_others.some((s) => s === tags_others[index])) return;
    setST_others([...selectedTags_others, tags_others[index]]);
  };

  const deleteTag_others = (index) => {
    const getIndex = selectedTags_others.findIndex((s) => s === tags_others[index]);
    setST_others(selectedTags_others.filter((s, i) => i !== getIndex));
  };

  //커스텀 태그
  const [customTag, setCT] = useState([]);
  const [CustomTagName, setCTN] = useState(null);

  const deleteCustomTag = (index) => {
    setCT(customTag.filter((s, i) => i !== index));
  };

  const [open, setOpen] = useState(false);
  const [canSubmit, setCanSubmit] = useState(true);

  const handleSubmit = (e) => {
    e?.preventDefault();
    setOpen(false);

    if (title === null) {
      alert("제목을 입력하세요.");
      setCanSubmit(true);
      return;
    } else if (images.length < 1) {
      alert("필기 사진을 한 장 이상 업로드해주세요.");
      setCanSubmit(true);
      return;
    } else if (selectedTags_subject.length + selectedTags_others.length + customTag.length < 1) {
      alert("태그를 하나 이상 선택해주세요.");
      setCanSubmit(true);
      return;
    }

    const postData = {
      title: title,
      images: images,
      tags: [...selectedTags_subject, ...selectedTags_others, ...customTag],
    };

    axios
      .post(`${settings.api.domain}/api/event/notes/post`, postData, {
        withCredentials: true,
      })
      .then((res) => {
        switch (res.data.status) {
          case "error":
            alert(res.data.message);
            break;
          case "success":
            alert(res.data.message);
            window.location.replace(`/time/event/notes`);
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

  const inputRef = useRef(null);

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
            <br />
            <span className={styles.title}>제목</span>
            <TextField
              variant="standard"
              autoComplete="off"
              placeholder="제목을 입력하세요."
              id="title"
              onChange={(e) => {
                checkLength(e, 5, 50, setTitle);
              }}
              helperText={errorTitle.message}
              error={errorTitle.status}
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
              {({ imageList, onImageUpload, onImageRemove, errors }) => (
                <>
                  <span className={styles.title} style={{ flexDirection: "column" }}>
                    <div className={styles.title} style={{ alignItems: "center" }}>
                      이미지 업로드 (최대 10장)
                      <IconButton onClick={onImageUpload}>
                        <Add />
                      </IconButton>
                    </div>
                    <span style={{ fontSize: "0.7rem" }}>(png, jpg, jpeg)</span>
                  </span>
                  {errors && (
                    <div>
                      {errors.maxNumber && (
                        <span>이미지는 최대 10장까지만 업로드할 수 있습니다.</span>
                      )}
                      {errors.acceptType && <span>지원되지 않는 파일 형식입니다</span>}
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
                        <img src={image["data_url"]} alt="" className={styles.imageArray} />
                        <span
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            wordBreak: "break-all",
                          }}
                        >
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
            <br />
            <span>태그 (1개 이상)</span>
            <div className={styles.Select_tagsSubject}>
              <FormGroup sx={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
                {tags_subject[grade - 1]?.map((t, i) => (
                  <FormControlLabel
                    key={i}
                    control={
                      <Checkbox
                        onClick={(e) => {
                          if (e.target.checked) {
                            AddTag_subject(grade, i);
                          } else {
                            deleteTag_subject(grade, i);
                          }
                        }}
                      />
                    }
                    label={t}
                    sx={{ color: "var(--subject-tag-color)" }}
                  />
                ))}
                {tags_others?.map((t, i) => (
                  <FormControlLabel
                    key={i}
                    control={
                      <Checkbox
                        onClick={(e) => {
                          if (e.target.checked) {
                            AddTag_others(i);
                          } else {
                            deleteTag_others(i);
                          }
                        }}
                      />
                    }
                    label={t}
                    sx={{ color: "var(--others-tag-color)" }}
                  />
                ))}
                {customTag?.map((c, i) => (
                  <FormControlLabel
                    key={i}
                    control={
                      <Checkbox
                        onClick={(e) => {
                          if (!e.target.checked) {
                            deleteCustomTag(i);
                          }
                        }}
                      />
                    }
                    label={c}
                    sx={{ color: "var(--custom-tag-color)" }}
                    checked={customTag?.some((u) => u === c) ? true : false}
                  />
                ))}
              </FormGroup>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "nowrap",
                  flexDirection: "row",
                }}
              >
                <TextField
                  variant="standard"
                  placeholder="태그 직접 추가"
                  onChange={(e) => setCTN(e.target.value)}
                  inputRef={inputRef}
                />
                <IconButton
                  onClick={(e) => {
                    if (customTag?.some((c) => c === CustomTagName))
                      return alert("이미 추가된 태그입니다.");

                    setCT([...customTag, CustomTagName]);
                    if (inputRef.current) {
                      inputRef.current.value = "";
                    }
                  }}
                >
                  <AddCircle />
                </IconButton>
              </div>
            </div>
            <br />
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

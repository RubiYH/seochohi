import { AppBar, Box, Breadcrumbs, Button, Fade, Modal, Toolbar, Typography } from "@mui/material";
import axios from "axios";
import { useState } from "react";
import settings from "../../settings";
import Navbar from "../Modules/Navbar/Navbar";
import { HandleResponse } from "../Modules/ResponseCode";
import ConfirmPrivacy from "./pages/confirmPrivacy";
import EnterContact from "./pages/enterContact";
import EnterPassword from "./pages/enterPassword";
import EnterStudentCard from "./pages/enterStudentCard";
import EnterStudentInfo from "./pages/enterStudentInfo";
import EnterUserInfo from "./pages/enterUserInfo";
import styles from "./Register.module.css";

export default function Register(props) {
  const FormControlFlex = {
    position: "relative",
    width: "100%",
    display: "flex",
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    justifyContent: "space-between",
  };

  const FormLabelStyle = {
    whiteSpace: "nowrap",
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "nowrap",
    fontSize: "1rem",
  };

  const [confirmPrivacy, setCP] = useState(false);
  const [Grade, setGrade] = useState(null);
  const [Class, setClass] = useState(null);
  const [studentID, setSID] = useState(null);
  const [username, setUsername] = useState(null);
  const [gender, setGender] = useState(null);
  const [phone, setPhone] = useState(null);
  const [email, setEmail] = useState(null);
  const [StudentCard, setSC] = useState(null);
  const [password, setPassword] = useState(null);
  const [password_RE, setPassword_RE] = useState(null);

  const [validPassword, setVP] = useState({ status: null, message: null });
  const [samePassword, setSP] = useState({ status: null, message: null });

  const [open, setOpen] = useState(false);
  const [disableSubmit, setDS] = useState(false);

  //post
  const handleSubmit = (e) => {
    setDS(true);

    if (!canGoNext) {
      setDS(false);
      alert("필수 정보를 모두 입력해주세요.");
      return;
    }

    if (samePassword.status !== "success") {
      setDS(false);
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    const registerData = {
      grade: parseInt(Grade) || null,
      class: parseInt(Class) || null,
      studentID: parseInt(studentID) || null,
      username: username || null,
      gender: gender,
      phone: phone || null,
      email: email || null,
      StudentCard: StudentCard || null,
      password: password || null,
    };

    axios
      .post(`${settings.api.domain}/api/register`, registerData, {
        withCredentials: true,
      })
      .then((res) => {
        switch (res.data.status) {
          case "error":
            setDS(false);
            alert("회원가입에 실패하였습니다. " + res.data.message);
            break;
          case "alreadyExists":
            setDS(false);
            alert(res.data.message);
            window.location.replace("/login");
            break;
          case "incorrect":
            setDS(false);
            alert(res.data.message);
            break;
          case "success":
            setDS(false);
            setOpen(true);
            break;
          case "pending":
            setDS(true);
            alert(res.data.message);
            window.location.replace("/");
            break;
          default:
            setDS(false);
            alert("오류가 발생하였습니다.");
            window.location.reload();
            break;
        }
      })
      .catch((e) => {
        HandleResponse(e);
      });
  };

  const [page, setPage] = useState(0);

  const [canGoNext, setCGN] = useState(false);

  const NextPage = () => {
    if (!confirmPrivacy) return alert("약관에 동의하셔야 회원가입이 가능합니다.");
    if (page === 3 && !email && !phone)
      return alert("본인의 전화번호와 이메일 중 최소 한 가지를 입력해주세요.");
    if (page === 4 && StudentCard?.length < 1)
      return alert("재학생 인증을 위해 학생증 카드 사진을 업로드해주세요.");
    if (confirmPrivacy && !canGoNext) return alert("필수 정보를 모두 입력해주세요.");

    setPage(page + 1);
  };

  const PrevPage = () => {
    if (page === 0) {
      window.history.go(-1);
      return;
    }
    setPage(page - 1);
  };

  return (
    <>
      <Navbar type="back" name={props?.name} />
      <div className="wrapper top column" style={{ position: "initial" }}>
        <div className="content column" style={{ position: "initial" }}>
          <Breadcrumbs className={styles.Breadcrumbs}>
            <Typography
              color={page === 1 ? "var(--link-color)" : "GrayText"}
              style={{ fontSize: "0.7rem" }}
            >
              학생 정보
            </Typography>
            <Typography
              color={page === 2 ? "var(--link-color)" : "GrayText"}
              style={{ fontSize: "0.7rem" }}
            >
              본인 정보
            </Typography>
            <Typography
              color={page === 3 ? "var(--link-color)" : "GrayText"}
              style={{ fontSize: "0.7rem" }}
            >
              연락처
            </Typography>
            <Typography
              color={page === 4 ? "var(--link-color)" : "GrayText"}
              style={{ fontSize: "0.7rem" }}
            >
              학생증
            </Typography>
            <Typography
              color={page === 5 ? "var(--link-color)" : "GrayText"}
              style={{ fontSize: "0.7rem" }}
            >
              비밀번호
            </Typography>
          </Breadcrumbs>

          <Box>
            <AppBar
              sx={{
                background: "white",
                position: "absolute",
                left: 0,
                top: 0,
                width: "100%",
                whiteSpace: "nowrap",
                zIndex: 2000,
                boxShadow: "none",
              }}
            >
              <Toolbar>
                <div className={styles.controller}>
                  <Button variant="outlined" onClick={() => PrevPage()}>
                    {page === 0 ? "뒤로" : "이전"}
                  </Button>
                  {page === 5 ? (
                    <Button
                      variant="contained"
                      type="submit"
                      color="success"
                      onClick={() => {
                        handleSubmit();
                      }}
                      disabled={disableSubmit}
                      disableElevation
                    >
                      완료
                    </Button>
                  ) : (
                    <Button variant="contained" onClick={() => NextPage()} disableElevation>
                      다음
                    </Button>
                  )}
                </div>
              </Toolbar>
            </AppBar>
          </Box>

          <div className={styles.register_form}>
            <Box
              component="form"
              noValidate={false}
              sx={{ width: "100%", textAlign: "center" }}
              method="POST"
            >
              {page === 0 && (
                <ConfirmPrivacy
                  title="약관"
                  description="개인정보 수집 및 이용 약관"
                  data={{
                    confirmPrivacy,
                    setCP,
                    FormControlFlex,
                    FormLabelStyle,
                    setCGN,
                  }}
                />
              )}
              {page === 1 && (
                <EnterStudentInfo
                  title="학생 정보"
                  description="본인의 학년, 반, 번호를 입력해주세요."
                  data={{
                    Grade,
                    setGrade,
                    Class,
                    setClass,
                    studentID,
                    setSID,
                    FormControlFlex,
                    FormLabelStyle,
                    setCGN,
                  }}
                />
              )}
              {page === 2 && (
                <EnterUserInfo
                  title="본인 정보"
                  description="본인의 이름과 성별을 입력해주세요."
                  data={{
                    username,
                    setUsername,
                    gender,
                    setGender,
                    FormControlFlex,
                    FormLabelStyle,
                    setCGN,
                  }}
                />
              )}
              {page === 3 && (
                <EnterContact
                  title="연락처"
                  description="본인의 연락처 정보를 하나 이상 입력해주세요. 입력해주신 연락처로 가입 승인 여부를 알려드리며, 계정 보안을 위해 나중에 본인인증 수단으로 사용될 수 있습니다."
                  data={{
                    phone,
                    setPhone,
                    email,
                    setEmail,
                    FormControlFlex,
                    FormLabelStyle,
                    setCGN,
                  }}
                />
              )}
              {page === 4 && (
                <EnterStudentCard
                  title="학생증 인증"
                  description="재학생 인증을 위해 본인의 학생증 카드 사진을 업로드하세요."
                  data={{
                    StudentCard,
                    setSC,
                    FormControlFlex,
                    FormLabelStyle,
                    setCGN,
                  }}
                />
              )}
              {page === 5 && (
                <EnterPassword
                  title="비밀번호"
                  description="로그인 시 사용할 비밀번호를 입력해주세요. 비밀번호는 암호화되어 전송 및 저장됩니다."
                  data={{
                    password,
                    setPassword,
                    password_RE,
                    setPassword_RE,
                    validPassword,
                    setVP,
                    samePassword,
                    setSP,
                    FormControlFlex,
                    FormLabelStyle,
                    setCGN,
                  }}
                />
              )}
            </Box>
          </div>
        </div>
        <Modal open={open} closeAfterTransition>
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
              <div
                style={{
                  width: "100%",
                  margin: "0",
                  display: "flex",
                  flexDirection: "column",
                  flexWrap: "nowrap",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <span style={{ color: "#00a152", margin: "8px 0 8px 0" }}>
                  회원가입 요청을 완료하였습니다.
                </span>
                <span>
                  재학생 인증은 1일 이내로 처리되며, 재학생 인증 완료 후 가입이 승인됩니다.
                </span>
                <span style={{ color: "#d32f2f" }}>
                  재학생 인증 과정에 문제가 있을 시 회원가입이 취소될 수 있습니다.
                </span>
                <Button
                  variant="contained"
                  onClick={() => {
                    setOpen(false);
                    window.location.replace("/");
                  }}
                >
                  완료
                </Button>
              </div>
            </Box>
          </Fade>
        </Modal>
      </div>
    </>
  );
}

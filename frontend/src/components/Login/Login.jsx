import { Check } from "@mui/icons-material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  IconButton,
  Input,
  InputAdornment,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "axios";
import { useState } from "react";
import settings from "../../settings";
import { maxLengthCheck } from "../Modules/maxLengthCheck";
import Navbar from "../Modules/Navbar/Navbar";
import styles from "./Login.module.css";

export default function Login(props) {
  const [checkId, setCheckId] = useState({ valid: true, value: null });
  const [checkPassword, setCheckPassword] = useState({
    valid: true,
    value: null,
  });

  const [Password, setPassword] = useState(null);

  const [keepLoggedIn, setKLI] = useState(true);

  function checkValidity(value, type) {
    let isValid = value === null ? true : value.length < 1;
    if (onError.status) {
      setError({ status: false, message: null });
    }

    if (type === "id") {
      setCheckId({ valid: !isValid, value: value });
    } else if (type === "password") {
      setCheckPassword({ valid: !isValid, value: value });
    }

    if (isValid) return false;
  }

  function Login() {
    if (
      checkValidity(checkId.value, "id") === false ||
      checkValidity(checkPassword.value, "password") === false
    )
      return;

    setLoading({ status: true, icon: "loading" });
    axios
      .post(
        `${settings.api.domain}/api/login`,
        {
          id: checkId.value,
          password: Password,
          keepLoggedIn: keepLoggedIn,
        },
        { withCredentials: true }
      )
      .then((res) => {
        //로그인 처리

        switch (res.data.status) {
          case "error":
            setLoading({ status: false, icon: null });
            alert("로그인에 실패하였습니다. " + res.data.message);
            break;
          case "notRegistered":
            setLoading({ status: false, icon: null });
            alert(res.data.message);
            break;
          case "unauthorized":
            setLoading({ status: false, icon: null });
            alert(res.data.message);
            break;
          case "pending":
            setLoading({ status: false, icon: null });
            alert(res.data.message);
            window.location.replace("/");
            break;
          case "success":
            // 로그인 성공
            setLoading({ status: false, icon: "done" });
            window.location.replace("/");
            break;
          case "newSession":
            // 새로운 환경에서 로그인
            setLoading({ status: false, icon: null });
            window.location.replace(`/verifylogin?t=${res.data.rt}`);
            break;
          default:
            setLoading({ status: false, icon: null });
            alert("오류가 발생하였습니다.");
            break;
        }
      })
      .catch((err) => {
        console.log(err);
        setError({ status: "true", message: err.message });
      });
  }

  const [showPassword, setShowPassword] = useState("password");

  //오류 메시지
  const [onError, setError] = useState({ status: false, message: null });
  const Error = styled("div")(({ theme }) => ({
    ...theme.components.MuiButton,
    color: theme.palette.error.main,
    minWidth: "calc(250px - 2rem)",
    fontSize: "0.6rem",
    marginTop: "0.4rem",
    marginBottom: "0.4rem",
    wordBreak: "break-all",
  }));

  const [isLoading, setLoading] = useState({ status: false, icon: "loading" });

  return (
    <>
      <Navbar type="login" name={props?.name} />
      <div className="wrapper center">
        <div className="content">
          {/* 이미 로그인했으면 */}

          <>
            <div className={styles.LoginForm}>
              <div className={styles.header}>
                <span className={styles.title}>로그인</span>
                <br />
                <span className={styles.description}>로그인하여 서초하이를 이용해보세요.</span>
              </div>
              <div className={styles.form}>
                <FormControl error={!checkId.valid}>
                  <Input
                    variant="outlined"
                    sx={{ marginTop: "2rem" }}
                    id="input_id"
                    placeholder="학번"
                    type="number"
                    onChange={(e) => {
                      maxLengthCheck(e, null, 5);
                      checkValidity(e.target.value, "id");
                    }}
                    error={!checkId.valid}
                  />
                  {!checkId.valid && (
                    <FormHelperText sx={{ marginLeft: 0 }}>학번을 입력해주세요.</FormHelperText>
                  )}
                </FormControl>

                <FormControl error={!checkPassword.valid}>
                  <Input
                    sx={{ marginTop: "2rem" }}
                    id="input_password"
                    placeholder="비밀번호"
                    type={showPassword}
                    onChange={(e) => {
                      checkValidity(e.target.value, "password");
                      setPassword(e.target.value);
                    }}
                    error={!checkPassword.valid}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => {
                            showPassword === "password"
                              ? setShowPassword("text")
                              : setShowPassword("password");
                          }}
                          size="small"
                        >
                          {showPassword === "password" ? (
                            <VisibilityOffIcon fontSize="0.5rem" />
                          ) : (
                            <VisibilityIcon fontSize="0.5rem" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                  {!checkPassword.valid && (
                    <FormHelperText sx={{ marginLeft: 0 }}>비밀번호를 입력해주세요.</FormHelperText>
                  )}
                </FormControl>
                <FormGroup sx={{ marginTop: "1rem" }}>
                  <FormControlLabel
                    sx={{
                      "& .MuiTypography-root": { fontSize: "0.8rem" },
                    }}
                    control={
                      <Checkbox
                        size="small"
                        defaultChecked
                        onChange={(e) => {
                          e.target.checked ? setKLI(true) : setKLI(false);
                        }}
                      />
                    }
                    label="로그인 유지하기"
                  />
                </FormGroup>

                {onError.status && <Error>로그인에 실패하였습니다. {onError.message}</Error>}

                <Button
                  variant="outlined"
                  sx={{
                    marginBottom: "1rem",
                    marginTop: "1rem",
                    borderRadius: "30px",
                  }}
                  onClick={() => {
                    Login();
                  }}
                  disabled={isLoading.status}
                >
                  {isLoading.status && isLoading.icon !== null && <CircularProgress />}
                  {!isLoading.status && isLoading.icon !== "done" && <>로그인</>}
                  {isLoading.icon === "done" && <Check />}
                </Button>
                <Button
                  variant="contained"
                  component="a"
                  href="/register"
                  disableElevation
                  sx={{ borderRadius: "30px" }}
                >
                  회원가입
                </Button>
              </div>
              <div className={styles.moreoptions}>
                {/* <span>
                <a href="/login/newstudent/register">전학생</a>
              </span>
              <Divider variant="middle" orientation="vertical" /> */}
                <span>
                  {/* <a href="/login/resetmypassword">비밀번호 재설정</a> */}
                  <a
                    href="#"
                    onClick={() => alert("비밀번호 재설정은 shs.startup@gmail.com에 문의해주세요.")}
                  >
                    비밀번호 재설정
                  </a>
                </span>
              </div>
            </div>
          </>
        </div>
      </div>
    </>
  );
}

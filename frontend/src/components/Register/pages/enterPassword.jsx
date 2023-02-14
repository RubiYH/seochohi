import { Box, FormControl, FormLabel, TextField } from "@mui/material";
import { rules } from "../rules";

import { useEffect } from "react";
import styles from "../Register.module.css";

export default function EnterPassword(props) {
  const {
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
  } = props.data;

  useEffect(() => {
    if (!password || !password_RE) {
      setCGN(false);
    } else {
      setCGN(true);
    }
  }, [password, password_RE]);

  const isValidPassword = (p) => {
    if (!rules.passwordRegex.test(p.trim())) {
      setVP({
        status: "error",
        message: "영문, 숫자, 특수문자 포함 8~20자리 이내",
      });
    } else {
      setVP({ status: "success", message: "사용 가능한 비밀번호입니다." });
    }
  };

  const isSamePassword = (p) => {
    if (p.trim().length >= 1) {
      if (password !== p) {
        setSP({
          status: "error",
          message: "비밀번호가 일치하지 않습니다.",
        });
      } else {
        if (!rules.passwordRegex.test(p.trim())) {
          setSP({
            status: "incorrect",
            message: "비밀번호 형식이 올바르지 않습니다.",
          });
          return;
        }
        setSP({ status: "success", message: "비밀번호가 일치합니다." });
      }
    } else {
      setSP({ status: null, message: null });
    }
  };

  return (
    <>
      <h2 className={styles.description}>{props.description}</h2>
      <Box className={styles.RegisterForm}>
        <FormControl sx={FormControlFlex} style={{ flexWrap: "wrap" }}>
          <FormLabel sx={FormLabelStyle}>비밀번호*</FormLabel>
          <TextField
            variant="outlined"
            size="small"
            sx={{ width: "10rem" }}
            margin="normal"
            type="password"
            name="password"
            placeholder="비밀번호"
            required
            onChange={(e) => {
              setPassword(e.target.value);
              isValidPassword(e.target.value);
              isSamePassword(e.target.value);
            }}
            helperText={validPassword.message}
            FormHelperTextProps={{
              style: {
                color:
                  validPassword.status === "success" ? "#66BB6A" : "#d32f2f",
                position: "absolute",
                top: "2.5rem",
              },
            }}
            defaultValue={password}
          />
        </FormControl>
        <FormControl sx={FormControlFlex} style={{ flexWrap: "wrap" }}>
          <FormLabel sx={FormLabelStyle}>비밀번호 확인*</FormLabel>
          <TextField
            variant="outlined"
            size="small"
            sx={{ width: "10rem" }}
            margin="normal"
            type="password"
            name="password_re"
            placeholder="비밀번호 확인"
            required
            onChange={(e) => {
              setPassword_RE(e.target.value);
              isSamePassword(e.target.value);
            }}
            helperText={samePassword.message}
            FormHelperTextProps={{
              style: {
                color:
                  samePassword.status === "success" ? "#66BB6A" : "#d32f2f",
                position: "absolute",
                top: "2.5rem",
              },
            }}
            defaultValue={password_RE}
          />
        </FormControl>
      </Box>
    </>
  );
}

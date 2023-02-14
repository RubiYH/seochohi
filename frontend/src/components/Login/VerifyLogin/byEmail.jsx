import { Button, TextField } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import settings from "../../../settings";
import { HandleResponse } from "../../Modules/ResponseCode";
import styles from "./VerifyLogin.module.css";

export default function ByEmail(props) {
  const {
    email,
    setEmail,
    username,
    setUsername,
    phone,
    setPhone,
    Type,
    setType,
    showComp,
    setComp,
    continueVerify,
  } = props.data;

  const [from, setFrom] = useState(null);

  useEffect(() => {
    getNewCode(false);
  }, []);

  const [code, setCode] = useState(null);

  function getNewCode(isNew) {
    axios
      .get(`${settings.api.domain}/api/verifyLogin`, {
        params: { method: "byEmail", email: email.raw },
        withCredentials: true,
      })
      .then((res) => {
        switch (res.data.status) {
          case "error":
            alert(res.data.message);
            window.history.go(-1);
            break;
          case "success":
            setFrom(res.data.from);

            if (isNew) {
              alert("인증 코드를 재발송하였습니다.");
            }
            break;
          default:
            alert(res.data.message);
            window.history.go(-1);
            break;
        }
      })
      .catch((e) => {
        HandleResponse(e);
      });
  }

  const verifyConfirm = () => {
    axios
      .get(`${settings.api.domain}/api/verify/email`, {
        params: { code: code },
        withCredentials: true,
      })
      .then((res) => {
        switch (res.data.status) {
          case "error":
            alert(res.data.message);
            window.location.reload();
            break;

          case "success":
            alert(res.data.message);
            window.location.replace("/");
            break;

          case "wrong":
            alert(res.data.message);
            break;

          default:
            alert(res.data.message);
            window.history.go(-1);
            break;
        }
      });
  };
  return (
    <>
      <span>{`${email?.ID?.substring(0, 1).padEnd(
        email?.ID?.length,
        "*"
      )}@${email?.Domain?.substring(0, 2).padEnd(
        email?.Domain?.length,
        "*"
      )}로 인증 코드를 발송하였습니다.`}</span>
      <br />
      <small>
        메일이 수신되지 않을 경우 스팸 메일 보관함을 확인해주세요. 발신자 이메일
        주소는 {from}입니다.
      </small>
      <br />
      <TextField
        autoComplete="off"
        label="인증 코드를 입력하세요."
        onChange={(e) => {
          setCode(e.target.value);
        }}
        inputProps={{
          maxLength: 6,
        }}
      />
      <span className={styles.remainingTime}>
        인증 코드는 3분 후 만료됩니다. 재발송은{" "}
        <span onClick={() => getNewCode(true)} className={styles.newCode}>
          여기
        </span>
        를 클릭하세요.
      </span>
      <br />
      <Button variant="outlined" onClick={() => verifyConfirm()}>
        확인
      </Button>
    </>
  );
}

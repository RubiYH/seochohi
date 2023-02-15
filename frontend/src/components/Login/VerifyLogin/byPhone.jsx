import { Button, TextField } from "@mui/material";
import axios from "axios";
import { getApps, initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { useEffect, useState } from "react";
import settings from "../../../settings";
import styles from "./VerifyLogin.module.css";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "Redacted",
  authDomain: "Redacted",
  projectId: "Redacted",
  storageBucket: "Redacted",
  messagingSenderId: "Redacted",
  appId: "Redacted",
};

export default function ByPhone(props) {
  const { username, phone } = props.data;

  if (!getApps.length) {
    initializeApp(firebaseConfig);
  }

  const auth = getAuth();
  auth.languageCode = "ko";

  const [confirmationResult, setResult] = useState(null);

  useEffect(() => {
    window.recaptchaVerifier = new RecaptchaVerifier(
      "recaptcha-container",
      {
        size: "invisible",
        callback: (response) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        },
      },
      auth
    );

    verifySMS(phone, false);
  }, [phone]);

  function verifySMS(phone, isNew) {
    let PhoneNumber = `+82${phone}`;

    const appVerifier = window.recaptchaVerifier;
    signInWithPhoneNumber(auth, PhoneNumber, appVerifier)
      .then((result) => {
        setResult(result);
        if (isNew) {
          alert("인증 코드를 다시 전송하였습니다.");
        }
      })
      .catch((e) => {
        // 인증 오류 메시지
        let auth_codes = {
          "auth/too-many-requests": "요청 횟수가 너무 많습니다. 잠시 후 다시 시도해주세요.",
          "auth/invalid-phone-number":
            "전화번호가 올바르지 않습니다. 다른 인증 수단을 사용해주세요. ",
          "auth/quota-exceeded": "요청 횟수 한도를 초과하였습니다. 다른 인증 수단을 사용해주세요.",
        };

        let au = false;
        for (let c in auth_codes) {
          if (e.toString().includes(c)) {
            alert(auth_codes[c]);
            au = true;
            if (c === "auth/invalid-phone-number") {
              window.location.reload();
            }
          }
        }
        if (!au) {
          console.log(e.toString());
          alert("오류가 발생하였습니다. 나중에 다시 시도하세요.");
          window.location.reload();
        }
      });
  }

  const [authCode, setAuthCode] = useState(null);

  const confirmSMSAuth = () => {
    if (authCode.trim().length < 1) return alert("인증 코드를 입력하세요.");
    confirmationResult
      .confirm(authCode)
      .then((result) => {
        const uid = result?.user?.uid;
        const accessToken = result?._tokenResponse?.idToken;

        axios
          .post(
            `${settings.api.domain}/api/verify/phone`,
            {
              uid: uid,
              accessToken: accessToken,
            },
            { withCredentials: true }
          )
          .then((res) => {
            switch (res.data.status) {
              case "success":
                alert("인증되었습니다.");
                window.location.replace("/");
                break;

              case "unauthorized":
                alert(res.data.message);
                window.history.go(-1);
                break;

              default:
                alert(res.data.message);
                window.history.go(-1);
                break;
            }
          });
      })
      .catch((e) => {
        switch (e.code) {
          case "auth/code-expired":
            alert("인증 코드가 만료되었습니다.");
            break;

          case "auth/invalid-verification-code":
            alert("인증 코드가 올바르지 않습니다.");
            break;

          case "auth/session-expired":
            alert("인증 세션이 만료되었습니다.");
            break;

          case "auth/missing-code":
            alert("인증 코드를 입력하세요.");
            break;
          default:
            console.log(e.code);
            alert("오류가 발생하였습니다. 잠시 후 다시 시도하거나 다른 인중 수단을 사용해주세요.");
            break;
        }
      });
  };

  const getNewCode = () => {
    verifySMS(phone, true);
  };

  return (
    <>
      <span>
        {username}님의 휴대전화
        {phone === "null" ? "" : `(${phone?.slice(-4).padStart(phone?.length, "*")})`}로 인증 코드를
        전송하였습니다.
      </span>
      <br />
      <span>
        <small>
          휴대전화 메시지를 확인해주세요. 인증 코드를 받지 못했을 경우 차단된 메시지를 확인해주세요.
          또는{" "}
          <span className={styles.newCode} onClick={() => getNewCode()}>
            여기
          </span>
          를 클릭하여 새 인증 코드를 받으세요.
        </small>
      </span>
      <br />
      <TextField
        autoComplete="off"
        label="인증 코드를 입력하세요."
        onChange={(e) => setAuthCode(e.target.value)}
        inputProps={{
          maxLength: 6,
        }}
      />
      <br />
      <Button variant="contained" onClick={() => confirmSMSAuth()}>
        확인
      </Button>
      <div id="recaptcha-container"></div>
    </>
  );
}

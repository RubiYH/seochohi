import { Checkbox, FormControlLabel, Typography } from "@mui/material";
import { useEffect } from "react";
import PrivacyText from "../../Privacy/PrivacyText";
import styles from "../Register.module.css";

export default function ConfirmPrivacy(props) {
  const { confirmPrivacy, setCP, setCGN } = props.data;

  useEffect(() => {
    if (confirmPrivacy) {
      setCGN(true);
    } else {
      setCGN(false);
    }
  }, [confirmPrivacy]);

  return (
    <>
      <h2 className={styles.description}>{props.description}</h2>
      <span
        style={{
          marginTop: "4px",
          fontSize: "0.8rem",
          textAlign: "left",
          display: "block",
        }}
      >
        '서초하이'는 원활하고 안전한 서비스 제공을 위해 서비스 이용 시 수집, 처리되는 정보들을
        회원가입 전과 <a href="/privacy">개인정보처리방침</a> 페이지에 명시하고 있습니다. 이에 따라
        '서초하이'의 모든 서비스를 이용하기 위해서는 아래 '개인정보 수집 및 이용 약관'에 대한 동의가
        필요합니다.
      </span>
      <br />
      <div className={styles.Privacy_wrapper}>
        <PrivacyText />
      </div>

      <div style={{ textAlign: "left" }}>
        <FormControlLabel
          control={<Checkbox onClick={() => setCP(!confirmPrivacy)} checked={confirmPrivacy} />}
          label={
            <Typography style={{ fontSize: "0.8rem" }}>
              개인정보 수집 및 이용 약관에 동의합니다.
            </Typography>
          }
        />
      </div>
    </>
  );
}

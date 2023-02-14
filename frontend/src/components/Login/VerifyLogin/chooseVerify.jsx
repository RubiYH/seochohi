import { Button, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import styles from "./VerifyLogin.module.css";

export default function ChooseVerify(props) {
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

  return (
    <>
      <span className={styles.h4}>
        새로운 환경에서 로그인이 감지되어 보안상의 이유로 본인인증이 필요합니다.
        <span className={styles.sub}>
          아래 옵션 중 하나를 택하여 본인인증을 진행해주세요. 문제가 있을 시{" "}
          <a href="/support">FAQ 및 문의</a> 페이지를 확인해주세요.
        </span>
      </span>

      <RadioGroup>
        <FormControlLabel
          value="byEmail"
          control={<Radio />}
          label={`${username}님의 이메일${
            !email || email?.raw === "null"
              ? ""
              : `(${email?.ID?.substring(0, 1).padEnd(
                  email?.ID?.length,
                  "*"
                )}@${email?.Domain?.substring(0, 2).padEnd(
                  email?.Domain?.length,
                  "*"
                )})`
          }로 인증 코드를 전송합니다.`}
          disabled={!email || email?.raw === "null"}
          onChange={(e) => {
            if (e.target.checked) {
              setType("byEmail");
            }
          }}
        />
        <FormControlLabel
          value="byPhone"
          control={<Radio />}
          label={`${username}님의 휴대전화${
            phone === "null"
              ? ""
              : `(${phone?.slice(-4).padStart(phone?.length, "*")})`
          }로 인증 코드를 전송합니다.`}
          disabled={phone === "null"}
          onChange={(e) => {
            if (e.target.checked) {
              setType("byPhone");
            }
          }}
        />
        <FormControlLabel
          value="byCard"
          control={<Radio />}
          label={`${username}님의 학교 학생증 카드로 인증합니다.`}
          disabled
          onChange={(e) => {
            if (e.target.checked) {
              setType("byCard");
            }
          }}
        />
      </RadioGroup>
      <br />
      <Button
        variant="contained"
        color="info"
        onClick={() => continueVerify(setComp(Type))}
      >
        인증
      </Button>
    </>
  );
}

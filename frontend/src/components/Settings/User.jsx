import { Card, Grid } from "@mui/material";
import { useMediaQuery } from "react-responsive";
import { MediaQuery } from "../Modules/MediaQuery";
import styles from "./Settings.module.css";

export default function UserInfo(props) {
  //responsive : Setting
  const SettingLayout = useMediaQuery({
    query: MediaQuery("Setting"),
  });

  const userInfo = props?.userInfo || null;
  const InfoSpan = props?.InfoSpan;
  const EditSpan = props?.EditSpan;

  const editInfo = () => {
    alert("내 정보 수정은 사이드 메뉴 하단에 위치한 [FAQ 및 문의] 탭을 참고해주세요.");
  };

  return (
    <Grid container rowSpacing={2} spacing={2}>
      {/* 개인정보 */}
      <Grid item xs={SettingLayout ? 12 : 6}>
        <Card className={styles.infoCard}>
          <span className={styles.cardHeader}>
            내 정보
            <EditSpan callback={editInfo} />
          </span>
          <div>
            <div className={styles.avatar}>
              <img src={userInfo?.AvatarURL} alt="" />
            </div>
            <table
              style={{
                width: "50%",
                borderSpacing: 0,
                textAlign: SettingLayout ? "left" : "center",
              }}
            >
              <tbody>
                <tr>
                  <td className={`${styles.infoRow} ${styles.key}`}>학년</td>
                  <td className={`${styles.infoRow} ${styles.value}`}>{userInfo?.Grade}학년</td>
                </tr>
                <tr>
                  <td className={`${styles.infoRow} ${styles.key}`}>반</td>
                  <td className={`${styles.infoRow} ${styles.value}`}>{userInfo?.Class}반</td>
                </tr>
                <tr>
                  <td className={`${styles.infoRow} ${styles.key}`}>번호</td>
                  <td className={`${styles.infoRow} ${styles.value}`}>{userInfo?.StudentID}번</td>
                </tr>
                <tr>
                  <td className={`${styles.infoRow} ${styles.key}`}>이름</td>
                  <td className={`${styles.infoRow} ${styles.value}`}>{userInfo?.Username}</td>
                </tr>
                <tr>
                  <td className={`${styles.infoRow} ${styles.key}`}>성별</td>
                  <td className={`${styles.infoRow} ${styles.value}`}>
                    {userInfo?.Gender === "m" ? "남" : userInfo?.Gender === "f" ? "여" : "없음"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </Grid>
      <Grid item xs={SettingLayout ? 12 : 6}>
        <Card className={styles.infoCard}>
          <span className={styles.cardHeader}>연락처</span>
          <table>
            <tbody>
              <tr className={styles.flexTr}>
                <td>
                  <div className={styles.infoRow}>
                    <span className={styles.key}>이메일</span>
                  </div>
                </td>
                <td>
                  <div
                    className={styles.infoRow}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      alignContent: "center",
                      flexwrap: "nowrap",
                      flexDirection: "row",
                    }}
                  >
                    <InfoSpan value={userInfo?.Email} />
                  </div>
                </td>
              </tr>
              <tr className={styles.flexTr}>
                <td>
                  <div className={styles.infoRow}>
                    <span className={styles.key}>전화번호</span>
                  </div>
                </td>
                <td>
                  <div
                    className={styles.infoRow}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      alignContent: "center",
                      flexwrap: "nowrap",
                      flexDirection: "row",
                    }}
                  >
                    <InfoSpan value={userInfo?.Phone} />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </Card>
      </Grid>
      <Grid item xs={SettingLayout ? 12 : 6}>
        <Card className={styles.infoCard}>
          <span className={styles.cardHeader}>기타</span>
        </Card>
      </Grid>
    </Grid>
  );
}

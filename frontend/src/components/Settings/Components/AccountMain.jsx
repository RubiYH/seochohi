import {
  Box,
  Button,
  Card,
  Fade,
  Grid,
  Modal,
  Typography,
} from "@mui/material";
import { format } from "date-fns";
import { useState } from "react";
import confirmLogout from "../Modules/confirmLogout";
import styles from "../Settings.module.css";

export default function AccountMain(props) {
  const {
    userInfo,
    InfoSpan,
    userData,
    EditSpan,
    SettingLayout,
    menu,
    setMenu,
  } = props?.data;

  //modal
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const Logout = () => {
    handleOpen();
  };

  //비밀번호 변경
  const changePassword = () => {
    alert(
      "비밀번호 변경은 사이드 메뉴 하단에 위치한 [FAQ 및 문의] 페이지 내 [보안] 탭을 참고해주세요."
    );
  };

  return (
    <Box sx={{ pb: 7 }}>
      <Grid container rowSpacing={2} spacing={2}>
        <Grid item xs={SettingLayout ? 12 : 6}>
          <Card className={styles.infoCard}>
            <span className={styles.cardHeader}>계정 정보</span>
            <table>
              <tbody>
                <tr className={styles.flexTr}>
                  <td>
                    <div className={`${styles.infoRow} ${styles.key}`}>
                      <span className={styles.key}>이름</span>
                    </div>
                  </td>
                  <td>
                    <div className={`${styles.infoRow} ${styles.value}`}>
                      <InfoSpan value={userInfo?.Username} />
                    </div>
                  </td>
                </tr>
                <tr className={styles.flexTr}>
                  <td>
                    <div className={`${styles.infoRow} ${styles.key}`}>
                      <span className={styles.key}>아이디</span>
                    </div>
                  </td>
                  <td>
                    <div className={`${styles.infoRow} ${styles.value}`}>
                      <InfoSpan value={userInfo?.ID} />
                    </div>
                  </td>
                </tr>
                <tr className={styles.flexTr}>
                  <td>
                    <div className={`${styles.infoRow} ${styles.key}`}>
                      <span className={styles.key}>가입 날짜</span>
                    </div>
                  </td>
                  <td>
                    <div className={`${styles.infoRow} ${styles.value}`}>
                      <span>
                        {userInfo?.CreatedAt &&
                          format(
                            new Date(userInfo?.CreatedAt),
                            "yyyy년 MM월 dd일"
                          )}
                      </span>
                    </div>
                  </td>
                </tr>
                <tr className={styles.flexTr}>
                  <td>
                    <div className={`${styles.infoRow} ${styles.key}`}>
                      <span className={styles.key}>상태</span>
                    </div>
                  </td>
                  <td>
                    <div className={`${styles.infoRow} ${styles.value}`}>
                      <span>{userInfo?.Status}</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>
        </Grid>
        <Grid item xs={SettingLayout ? 12 : 6}>
          <Card className={styles.infoCard}>
            <span className={styles.cardHeader}>보안 설정</span>
            <table style={{ borderSpacing: "0 1rem" }}>
              <tbody>
                <tr>
                  <td>
                    <div className={`${styles.infoRow} ${styles.key}`}>
                      <span className={styles.key}>비밀번호</span>
                    </div>
                  </td>
                  <td>
                    <div className={`${styles.infoRow} ${styles.value}`}>
                      <Button
                        variant="contained"
                        disableElevation
                        onClick={() => changePassword()}
                      >
                        비밀번호 변경
                      </Button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className={`${styles.infoRow} ${styles.key}`}>
                      <span className={styles.key}>세션</span>
                    </div>
                  </td>
                  <td>
                    <div className={`${styles.infoRow} ${styles.value}`}>
                      <Button
                        variant="outlined"
                        disableElevation
                        onClick={() => setMenu("manageSessions")}
                      >
                        세션 관리
                      </Button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>
        </Grid>
      </Grid>
      <div className={styles.logoutArea}>
        <Button
          variant="contained"
          color="error"
          disableElevation
          onClick={Logout}
        >
          로그아웃
        </Button>
        <Modal open={open} onClose={handleClose} closeAfterTransition>
          <Fade in={open}>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                bgcolor: "background.paper",
                textAlign: "center",
                boxShadow: 24,
                borderRadius: "var(--modal-radius)",
                p: 4,
              }}
            >
              <Typography
                variant="span"
                sx={{
                  whiteSpace: "nowrap",
                  width: "100%",
                  display: "block",
                }}
              >
                로그아웃하시겠습니까?
              </Typography>
              <Button
                variant="text"
                style={{ marginTop: "1rem" }}
                onClick={() => confirmLogout(userData)}
              >
                로그아웃
              </Button>
            </Box>
          </Fade>
        </Modal>
      </div>
    </Box>
  );
}

import { Button, Card, Grid } from "@mui/material";
import { useMediaQuery } from "react-responsive";
import { MediaQuery } from "../Modules/MediaQuery";
import styles from "./Settings.module.css";

export default function GeneralSettings(props) {
  //responsive : Setting
  const SettingLayout = useMediaQuery({
    query: MediaQuery("Setting"),
  });

  const { setTheme, Theme, setTT, ThemeType, lightTheme, darkTheme } =
    props?.data;

  return (
    <Grid container rowSpacing={2} spacing={2}>
      <Grid item xs={SettingLayout ? 12 : 6}>
        <Card className={styles.infoCard}>
          <span className={styles.cardHeader}>일반 설정</span>
          <table>
            <tbody>
              <tr>
                <td>
                  <div className={`${styles.infoRow} ${styles.key}`}>
                    <span className={styles.key}>테마</span>
                  </div>
                </td>
                <td>
                  <div className={`${styles.infoRow} ${styles.value}`}>
                    <Button
                      variant={ThemeType === "light" ? "contained" : "outlined"}
                      disableElevation
                      sx={{ marginRight: "1rem" }}
                      onClick={() => {
                        localStorage.setItem("theme", "light");

                        setTT("light");
                        window.location.reload("/settings#general");
                      }}
                    >
                      라이트 모드
                    </Button>
                    <Button
                      variant={ThemeType === "dark" ? "contained" : "outlined"}
                      disableElevation
                      onClick={() => {
                        localStorage.setItem("theme", "dark");

                        setTT("dark");
                        window.location.reload("/settings#general");
                      }}
                    >
                      다크 모드
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </Card>
      </Grid>
    </Grid>
  );
}

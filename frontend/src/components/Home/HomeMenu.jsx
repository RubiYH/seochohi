import { CardActionArea, Grid } from "@mui/material";
import styles from "./HomeMenu.module.css";

export default function HomeMenu(props) {
  const RippleStyle = {
    width: "100%",
    height: "100%",
    borderRadius: "var(--paper-radius)",
  };

  return (
    <Grid item xs={12} sx={{ paddingTop: "0 !important" }}>
      <div className={styles.container}>
        <Grid item xs={4}>
          <CardActionArea component="div" sx={RippleStyle}>
            <div className={styles.inner}>학사일정</div>
          </CardActionArea>
        </Grid>
        <Grid item xs={4}>
          <CardActionArea component="div" sx={RippleStyle}>
            <div className={styles.inner}>기출문제</div>
          </CardActionArea>
        </Grid>
        <Grid item xs={4}>
          <CardActionArea component="div" sx={RippleStyle}>
            <div className={styles.inner}>서초고숲</div>
          </CardActionArea>
        </Grid>
      </div>
    </Grid>
  );
}

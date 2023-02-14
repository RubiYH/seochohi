import { Button } from "@mui/material";
import styles from "./NotFound.module.css";
import errorImage from "./src/errorphone.png";

export default function NotFound() {
  return (
    <div className="wrapper">
      <div className={styles.container}>
        <img src={errorImage} alt="Error" />
        <h2>존재하지 않는 페이지입니다.</h2>
        <Button
          variant="outlined"
          onClick={() => {
            window.location.href = "/";
          }}
        >
          홈
        </Button>
      </div>
    </div>
  );
}

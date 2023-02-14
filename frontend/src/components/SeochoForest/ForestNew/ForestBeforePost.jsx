import { Checkbox, FormControlLabel } from "@mui/material";
import { useEffect, useState } from "react";
import styles from "./ForestBeforePost.module.css";

export default function BeforePost(props) {
  const [selected, SetSelected] = useState(true);
  const canSubmit = props?.canSubmit;

  useEffect(() => {
    canSubmit(true);
  }, []);

  return (
    <div
      style={{
        color: localStorage.getItem("theme") === "dark" ? "#fff" : "#000",
      }}
    >
      <span className={styles.warningTitle}>유의사항</span>
      <p>글을 올리기 전 아래 사항들을 먼저 확인해주세요.</p>
      <div className={styles.li}>
        <li>
          주제와 관련없는 내용은 포함되지 않도록 해주세요. 주제를 지나치게
          벗어날 경우 글이 삭제될 수도 있습니다.
        </li>
        <li>
          욕설, 비하, 도배 등 상대방에게 불쾌감을 줄 수 있는 부적절한 언어 또는
          이미지 등이 포함될 경우 별도의 통보 없이 글이 삭제되거나 경고가 부여될
          수 있습니다.
          <span style={{ color: "var(--warning-color" }}>
            경고 누적 3회 시 서초고숲 이용이 제한되며 교칙에 따라 징계를 받을 수
            있습니다.
          </span>
        </li>
        <li></li>
      </div>
      <FormControlLabel
        control={
          <Checkbox
            onClick={() => {
              SetSelected(!selected);
              canSubmit(!selected);
            }}
          />
        }
        label="상기 유의사항을 모두 읽었습니다."
      />
    </div>
  );
}

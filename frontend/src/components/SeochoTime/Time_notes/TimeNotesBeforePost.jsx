import { Checkbox, FormControlLabel } from "@mui/material";
import { useState } from "react";
import styles from "./TimeNotesBeforePost.module.css";

export default function BeforePost(props) {
  const [selected, SetSelected] = useState(true);
  const canSubmit = props.canSubmit;

  return (
    <div>
      <span className={styles.warningTitle}>유의사항</span>
      <p>글을 올리기 전에 아래 사항들을 먼저 확인해주세요.</p>
      <div className={styles.li}>
        <li>본인이 직접 필기한 사진만을 업로드해주세요.</li>
        <li>필기와는 관련이 없는 부적절한 사진이 업로드될 시 삭제될 수 있습니다.</li>
        <li>
          중복 참여는 가능하나 같은 게시물을 여러 번 올리는 경우, 이벤트 참여에서 제외될 수 있으며
          게시물이 삭제될 수 있습니다.
        </li>
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

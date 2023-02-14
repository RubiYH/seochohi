import { useState } from "react";
import Iframe from "react-iframe";
import { useLocation } from "react-router-dom";
import styles from "./MobileIframe.module.css";

export default function MobileIframe(props) {
  const [useIframe, setIframe] = useState(false);
  const location = useLocation();

  return (
    <div className={styles.iframe}>
      {!useIframe && (
        <>
          <h2>
            현재 PC 및 태블릿은 지원하지 않습니다. 모바일에서 접속해주세요.
          </h2>
          {/* <p>또는 모바일 뷰를 체험해보세요!</p>
          <Button
            variant="contained"
            onClick={() => {
              setIframe(true);
            }}
          >
            모바일 뷰로 계속하기
          </Button> */}
        </>
      )}
      {useIframe && (
        <Iframe
          url={location.pathname}
          width="450px"
          height="100%"
          frameBorder={0}
          styles={{ maxWidth: "450px" }}
        />
      )}
    </div>
  );
}

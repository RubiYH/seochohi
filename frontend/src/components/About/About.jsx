import Navbar from "../Modules/Navbar/Navbar";

import styles from "./About.module.css";
import { Teams } from "./Teams";

export default function About(props) {
  return (
    <>
      <Navbar type="menu" name={props?.name} />
      <div className="wrapper" style={{ height: "100%" }}>
        <div
          className="content column center"
          style={{ justifyContent: "flex-start" }}
        >
          <h2>서초하이</h2>
          <p>by 2022 서초고 스타트업 동아리</p>
          <div className="left">
            <span>부장 허윤호</span>
            <br />
            <span>차장 김다은, 강동원, 배민준</span>
            <div>
              <h2>기획팀</h2>
              <div className={styles.wrap}>
                {Teams.기획팀.map((t) => (
                  <span key={t}>
                    {t} <br />
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h2>마케팅팀</h2>
              <div className={styles.wrap}>
                {Teams.마케팅팀.map((t) => (
                  <span key={t}>
                    {t} <br />
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h2>개발팀</h2>
              <div className={styles.wrap}>
                {Teams.개발팀.map((t) => (
                  <span key={t}>
                    {t} <br />
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className={styles.credits}>
            Image by vectorjuice on Freepik Student icons created by Freepik -
            Flaticon
          </div>
        </div>
      </div>
    </>
  );
}

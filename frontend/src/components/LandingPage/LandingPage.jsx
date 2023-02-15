import { Button, CircularProgress } from "@mui/material";
import Aos from "aos";
import "aos/dist/aos.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Home from "../Home/Home";
import { checkSession } from "../Modules/Authorization/checkSession";
import styles from "./LandingPage.module.css";

import exams from "./exams.png";
import forest from "./forest.png";
import icon from "./icon.png";
import lunch from "./lunch.png";
import mockup from "./mockup.png";
import schedule from "./schedule.png";

export default function LandingPage(props) {
  const navigate = useNavigate();
  const [Loading, setLoading] = useState(true);

  //JWT 인증
  const [isAuth, setAuth] = useState(false);
  const [userData, setUserData] = useState({
    status: null,
    userID: null,
    username: null,
    gender: null,
  });

  useEffect(() => {
    checkSession({ ignore: props?.NeedAuth })
      .then((c) => {
        setAuth(c.isAuth);
        setUserData(c.userData);

        if (!c.isAuth) {
          switch (c.userData?.status) {
            case "invalid":
              alert("세션이 유효하지 않습니다. 다시 로그인해주세요.");
              window.location.replace("/login");
              break;

            case "unauthorized":
              setUserData({
                status: null,
                userID: null,
                username: null,
                gender: null,
              });
              break;

            default:
              break;
          }
        }
      })
      .then(() => {
        setLoading(false);
      });
  }, []);

  const ButtonStyle = {
    backgroundColor: "#1976d2",
    borderRadius: "30px",
  };

  //스크롤 애니메이션
  useEffect(() => {
    Aos.init({
      once: false,
      useClassNames: false,
      duration: 600,
      easing: "ease-out-quad",
    });
  }, []);

  return (
    <>
      {Loading ? (
        <div className="wrapper">
          <div className="content">
            <CircularProgress size={60} />
          </div>
        </div>
      ) : (
        <>
          {isAuth ? (
            <Home
              data={{
                isAuth: isAuth,
                setAuth: setAuth,
                userData: userData,
                setUserData: setUserData,
              }}
            />
          ) : (
            // 랜딩 페이지
            <>
              <div
                className="wrapper"
                style={{
                  background:
                    "radial-gradient(circle at 10% 20%,rgb(129 200 255) 0%,rgb(166, 239, 253) 90.1%)",
                }}
              >
                <div className={styles.fade}>
                  <div className={styles.nav}>
                    <img src={icon} alt="서초하이" />
                    서초하이! for 서초고등학교
                  </div>
                  <div className={styles.header}>
                    <div className={styles.intro}>
                      <div className={styles.desc}>
                        <h2 className={styles.title} data-aos="fade-up">
                          서초고를
                          <br />
                          한눈에!
                        </h2>
                        <span className={styles.subtitle} data-aos="fade-up">
                          서초고 학생들의 편리한 학교생활을 위해
                          <br />
                          스타트업 동아리에서 개발한 웹 애플리케이션!
                        </span>
                        <br />
                        <Button
                          className={styles.Login}
                          variant="contained"
                          sx={ButtonStyle}
                          data-aos="fade-up"
                          onClick={() => navigate("/login")}
                        >
                          로그인
                        </Button>
                      </div>
                      <div className={styles.mockup} data-aos="fade-down">
                        <img src={mockup} alt="" />
                      </div>
                    </div>
                  </div>
                  <div className={styles.preview}>
                    <div className={styles.previewMockups} data-aos="fade-up">
                      <img src={lunch} alt="급식" />
                      <span>급식</span>
                    </div>
                    <div className={styles.previewMockups} data-aos="fade-up">
                      <img src={schedule} alt="학사일정" />
                      <span>학사일정</span>
                    </div>
                    <div className={styles.previewMockups} data-aos="fade-up">
                      <img src={exams} alt="기출문제" />
                      <span>기출문제</span>
                    </div>
                    <div className={styles.previewMockups} data-aos="fade-up">
                      <img src={forest} alt="서초고숲" />
                      <span>서초고숲</span>
                    </div>
                  </div>
                </div>
                <footer id={styles.footer}>
                  Copyright 2022. 서초고 2022 스타트업 동아리
                  <br />
                  All rights reserved.
                  <br />
                  문의: shs.startup@gmail.com
                </footer>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}

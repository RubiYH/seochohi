import { isIE } from "react-device-detect";
import { Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import "./vars.css";

// import 컴포넌트
import NotFound from "./components/404NotFound/NotFound";
import MobileIframe from "./components/MobileIframe/MobileIframe";
import Settings from "./components/Settings/Settings";

import Login from "./components/Login/Login";
import Register from "./components/Register/Register";

import WikiExams from "./components/SeochoWiki/Wiki_exams/WikiExams";
import WikiLunch from "./components/SeochoWiki/Wiki_lunch/WikiLunch";
import WikiSchedule from "./components/SeochoWiki/Wiki_schedule/WikiSchedule";
import WikiTeachers from "./components/SeochoWiki/Wiki_teachers/WikiTeachers";

import Forest from "./components/SeochoForest/Forest/Forest";
import ForestMore from "./components/SeochoForest/Forest/ForestMore";
import ForestNew from "./components/SeochoForest/ForestNew/ForestNew";

import MyClassQuickNotes from "./components/MyClass/MyClass_quicknotes/MyClassQuickNotes";
import MyClassTimeTable from "./components/MyClass/MyClass_timetable/MyClassTimeTable";
//

import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import About from "./components/About/About";
import Announcement from "./components/Announcement/Announcement";
import VerifyLogin from "./components/Login/VerifyLogin/VerifyLogin";
import { MediaQuery } from "./components/Modules/MediaQuery";
import MyClass from "./components/MyClass/MyClass";
import MyClassQuickNotesNew from "./components/MyClass/MyClass_quicknotes/MyClassQuickNotesNew";
import MyClassQuickNotesView from "./components/MyClass/MyClass_quicknotes/MyClassQuickNotesView";
import Privacy from "./components/Privacy/Privacy";
import Support from "./components/Support/Support";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import LandingPage from "./components/LandingPage/LandingPage";

function App() {
  //responsive PC
  const isDesktopOrLaptop = useMediaQuery({
    query: MediaQuery("PC"),
  });

  //responsive : Mobile
  const isTabletOrMobile = useMediaQuery({
    query: MediaQuery("Mobile"),
  });

  //테마
  const darkTheme = createTheme({
    palette: {
      mode: "dark",
    },
  });

  const lightTheme = createTheme({
    palette: {
      mode: "light",
    },
  });

  const [Theme, setTheme] = useState(lightTheme);
  const [ThemeType, setTT] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    if (localStorage.getItem("theme") === "light") {
      setTheme(lightTheme);
      setTT("light");
    } else if (localStorage.getItem("theme") === "dark") {
      setTheme(darkTheme);
      setTT("dark");
      document.querySelector("html").style.background = "#121212";
    } else {
      localStorage.setItem("theme", "light");
      setTheme(lightTheme);
      setTT("light");
    }
  }, []);

  const location = useLocation();

  //IE detection
  if (isIE) {
    return (
      <div style={{ textAlign: "center" }}>
        <strong>
          이 웹사이트는 인터넷 익스플로러를 지원하지 않습니다. 다른 브라우저를
          이용해주시기 바랍니다.
        </strong>
      </div>
    );
  }

  return (
    <ThemeProvider theme={Theme}>
      <TransitionGroup className="App">
        <CSSTransition
          key={location.pathname}
          classNames={{
            enter: "routerMotion-enter",
            enterActive: "routerMotion-enter-active",
            exit: "routerMotion-exit",
            exitActive: "routerMotion-exit-active",
          }}
          timeout={500}
          unmountOnExit
        >
          <div
            className="container"
            id={ThemeType === "dark" ? "dark" : "light"}
          >
            {/* PC 버전 접근 방지 */}
            {!isTabletOrMobile && <MobileIframe />}
            {isTabletOrMobile && (
              <>
                {/* {isDesktopOrLaptop && <SideMenu />} */}

                <Routes location={location}>
                  <Route exact path="/" element={<LandingPage />} />

                  <Route path="/login" element={<Login name="로그인" />} />
                  <Route
                    path="/verifylogin"
                    element={<VerifyLogin name="새로운 환경에서 로그인" />}
                  />
                  <Route
                    path="/register"
                    element={<Register name="회원가입" />}
                  />

                  <Route
                    path="/wiki/schedule"
                    element={<WikiSchedule name="학사일정" />}
                  />
                  <Route
                    path="/wiki/lunch"
                    element={<WikiLunch name="급식" />}
                  />
                  <Route
                    path="/wiki/exams"
                    element={<WikiExams name="기출" />}
                  />
                  <Route
                    path="/wiki/teachers"
                    element={<WikiTeachers name="선생님" />}
                  />

                  <Route
                    path="/announcement"
                    element={<Announcement name="공지사항" />}
                  />

                  <Route path="/forest" element={<Forest name="서초고숲" />} />
                  <Route
                    path="/forest/:tag/:uid/:pid"
                    element={<ForestMore name="서초고숲" />}
                  />

                  <Route
                    path="/forest/new"
                    element={<ForestNew name="글쓰기" />}
                  />
                  {/* 
                  <Route
                    path="/time/event/notes"
                    element={<TimeNotes name="필기공유" />}
                  />

                  <Route
                    path="/time/event/notes/new"
                    element={<TimeNotesNew name="필기 업로드" />}
                  /> */}

                  {/*

                !학생회 탭 보류
                <Route
                  path="/time/event/sc"
                  element={<TimeSC name="학생회" />}
                />

                */}

                  <Route path="/myclass" element={<MyClass name="내 학급" />} />
                  <Route
                    path="/myclass/timetable"
                    element={<MyClassTimeTable name="시간표" />}
                  />
                  <Route
                    path="/myclass/quicknotes"
                    element={<MyClassQuickNotes name="메모장" />}
                  />
                  <Route
                    path="/myclass/quicknotes/:id"
                    element={<MyClassQuickNotesView name="내 메모" />}
                  />
                  <Route
                    path="/myclass/quicknotes/new"
                    element={<MyClassQuickNotesNew name="새 메모" />}
                  />
                  {/*

                !수행평가 탭 보류
                <Route
                  path="/myclass/assessments"
                  element={<MyClassAssessments name="수행평가" />}
                /> 

                */}
                  <Route
                    path="/support"
                    element={<Support name="FAQ 및 문의" />}
                  />
                  <Route
                    path="/settings"
                    element={
                      <Settings
                        name="설정"
                        data={{
                          setTheme: setTheme,
                          Theme: Theme,
                          setTT: setTT,
                          ThemeType: ThemeType,
                          lightTheme: lightTheme,
                          darkTheme: darkTheme,
                        }}
                      />
                    }
                  />
                  <Route path="/about" element={<About name="정보" />} />
                  <Route
                    path="/privacy"
                    element={<Privacy name="개인정보처리방침" />}
                  />
                  {/* Not Found Page */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </>
            )}
          </div>
        </CSSTransition>
      </TransitionGroup>
    </ThemeProvider>
  );
}

export default App;

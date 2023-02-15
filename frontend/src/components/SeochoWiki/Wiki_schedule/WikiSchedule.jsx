import dayGridPlugin from "@fullcalendar/daygrid"; // a plugin!
import googleCalendarPlugin from "@fullcalendar/google-calendar";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react"; // must go before plugins
import { Card, Checkbox, FormControlLabel } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { checkSession } from "../../Modules/Authorization/checkSession";
import { switchSessionResult } from "../../Modules/Authorization/sessionSwitches";
import { MediaQuery } from "../../Modules/MediaQuery";
import Navbar from "../../Modules/Navbar/Navbar";
import events from "./events"; //일정
import filterList from "./filterList";
import styles from "./WikiSchedule.module.css";

export default function WikiSchedule(props) {
  //JWT 인증
  const [isAuth, setAuth] = useState(false);
  const [userData, setUserData] = useState({
    status: null,
    userID: null,
    username: null,
  });

  useEffect(() => {
    checkSession({ ignore: props?.NeedAuth }).then((c) => {
      setAuth(c.isAuth);
      setUserData(c.userData);

      if (!c.isAuth) {
        switchSessionResult(c.userData.status);
      }
    });
  }, []);

  //responsive : PC
  const isDesktopOrLaptop = useMediaQuery({
    query: MediaQuery("PC"),
  });

  const MemoizedEvents = useMemo(() => {
    return events;
  }, []);

  //날짜 포맷
  function getDate(date) {
    var year = date.getFullYear();
    var month = ("0" + (date.getMonth() + 1)).slice(-2);
    var day = ("0" + date.getDate()).slice(-2);
    var dateArray = [year, month, day];

    return dateArray;
  }

  let week = ["일", "월", "화", "수", "목", "금", "토"];

  const [eventsList, setEventsList] = useState({});

  //get events list
  function getEventsList(info) {
    let date = info.dateStr;
    let rawdate = info.date;
    let formatted = getDate(rawdate);

    let getEvents = events.filter((e) => e.start === date.toString()).reverse();
    setEventsList({ rawdate, formatted, getEvents });
  }

  return (
    <>
      {isAuth && (
        <>
          <style>
            {`
      .fc-event-title
        {white-space: nowrap; text-overflow: ellipsis; font-size: 0.8rem !important; font-weight: normal !important;}
      .fc-day-today
        {background-color: transparent !important;}
      .fc-day-today > div {
        border: 1px solid #Eb5545;
        height: 10px;
      }
      .fc-day-today > div > div > .fc-daygrid-day-number
        {color: #fff; background-color: #EB5545; user-select: none;} 
      .fc-scroller {
        overflow: hidden !important
      }
      .fc-toolbar-chunk {
        border-radius: 0 !important
      }
      .fc-daygrid-day-frame {
        overflow-y: hidden;
      }
      .fc-daygrid-day-frame:hover {
        background: rgba(0,0,0,0.1);
        cursor: pointer;
      }
      .fc-prev-button, .fc-next-button {
        margin: 16px !important;
        border-radius: 12px !important;
      }
      a[class~=fc-daygrid-event], a[class~=fc-daygrid-more-link] {
        z-index: -999 !important;
      }
      .fc-daygrid-event-dot {
        background-color: #3788d8;
      }
      .fc-scrollgrid, .fc-theme-standard {
        border: none !important;
      }
      td[role=presentation] {
        border-radius: var(--paper-radius) !important;
        border: none !important;
      }
      thead[role=presentation] > tr[role=row] > th {
        border: none !important;
      }
      th[role=presentation] {
        border-right-width: 0 !important;
      }
      tbody[role=presentation] > tr[role=row]:last-child td[role=gridcell].fc-day-disabled:last-child {
        border-bottom-right-radius: var(--paper-radius);
      }
      tbody[role=presentation] > tr[role=row]:last-child td[role=gridcell].fc-day-disabled:first-child {
        border-bottom-left-radius: var(--paper-radius);
      }
      tbody[role=presentation] > tr[role=row]:last-child td[role=gridcell].fc-daygrid-day:last-child > .fc-daygrid-day-frame:hover {
        border-bottom-right-radius: var(--paper-radius);
      }
      tbody[role=presentation] > tr[role=row]:last-child td[role=gridcell].fc-daygrid-day:first-child > .fc-daygrid-day-frame:hover {
        border-bottom-left-radius: var(--paper-radius);
      }
      
      @media only screen and (max-width: 520px) {
        // .fc-daygrid-more-link {
        //   display: none !important;
        // }

        // .fc-event-title {
        //   display: none !important;
        // }

        // .fc-daygrid-event-harness {
        //   display: inline-block;
        //   margin: 0;
        //   padding: 0;
        //   width: 1rem;
        // }

        .fc-event-title {
          text-overflow: initial;
          overflow: hidden !important;
        }
      }
`}
          </style>
          <Navbar type="menu" name={props?.name} />
          <div className="wrapper" style={{ padding: 0 }}>
            <div
              className="content"
              style={{
                flexDirection: "column",
              }}
            >
              {isDesktopOrLaptop && (
                <div className="title">
                  <h1>학사일정</h1>
                </div>
              )}
              <div className={styles.filterContainer}>
                {isDesktopOrLaptop && (
                  <>
                    <div className={styles.filterBoxPC}>
                      <span className={styles.filterTitle}>필터</span>
                      <div className={styles.filterItems}>
                        {/* 필터링 */}
                        {filterList.map((f) => (
                          <FormControlLabel
                            label={f.name}
                            key={f.value}
                            value={f.value}
                            control={<Checkbox />}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <Card className={styles.calendar}>
                <FullCalendar
                  plugins={[dayGridPlugin, googleCalendarPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  weekends={true}
                  events={MemoizedEvents}
                  locale="ko"
                  buttonText={{ today: "오늘" }}
                  headerToolbar={{
                    start: "prev",
                    center: "title",
                    end: "next",
                  }}
                  aspectRatio="1"
                  height="35rem"
                  dayMaxEventRows={true}
                  showNonCurrentDates={false}
                  moreLinkText="더보기"
                  moreLinkClick="none"
                  moreLinkHint="클릭하여 일정을 확인하세요."
                  expandRows={false}
                  dateClick={(info) => {
                    getEventsList(info);
                  }}
                  fixedWeekCount={false}
                />
              </Card>
              {Object.keys(eventsList).length > 0 && (
                <Card className={styles.eventList}>
                  <strong>
                    {eventsList.formatted[1]}월 {eventsList.formatted[2]}일{" "}
                    {week[eventsList.rawdate.getDay()]}요일
                  </strong>
                  {eventsList.getEvents.length === 0 && <p>일정이 없습니다.</p>}
                  {eventsList.getEvents.length > 0 &&
                    eventsList.getEvents.map((e) => (
                      <div key={e.title}>
                        <p>
                          <span className="fc-daygrid-event-dot" style={{ borderRadius: 0 }}></span>
                          {e.title}
                        </p>
                      </div>
                    ))}
                </Card>
              )}
              {Object.keys(eventsList).length === 0 && (
                <div
                  className={styles.eventList}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <span>날짜를 선택하여 일정을 확인하세요.</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

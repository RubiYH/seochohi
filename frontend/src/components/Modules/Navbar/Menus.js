//네비바 목록

const wikiList = [
  { name: "공지사항", url: "/announcement" },
  { name: "학사일정", url: "/wiki/schedule" },
  { name: "급식", url: "/wiki/lunch" },
  { name: "기출", url: "/wiki/exams" },
  // { name: "선생님", url: "/wiki/teachers" },
];

const forestList = [{ name: "서초고숲", url: "/forest" }];

const timeList = [
  // { name: "필기공유", url: "/time/event/notes", disabled: true },
];

const myclassList = [
  { name: "시간표", url: "/myclass/timetable" },
  // { name: "메모장", url: "/myclass/quicknotes" }, //! 개발중
  { name: "수행평가", url: "/myclass/assessments", enabled: false }, //!보류
];

export { wikiList, forestList, timeList, myclassList };

const settings = {
  api: {
    googleCalendarAPI: process.env.googleCalendarAPI,
    googleCalendarId: process.env.googleCalendarId,
    schoolapikey: process.env.REACT_APP_schoolapikey,
    domain: process.env.REACT_APP_DOMAIN, //axios 서버 주소
  },
  style: {
    primaryColor: "#ffffff", //"#43a047" -> 네비바
    darkColor: "#121212",
    textColor: "#000000",
  },
  server: {
    Maintenance_Mode: false, //maintenance
    Banner: false,
    BottomPopup: false,
  },
  maxImageSize: 50 * 1000000,
  email: "shs.startup@gmail.com",
};

export default settings;

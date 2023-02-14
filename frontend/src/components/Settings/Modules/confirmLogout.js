const { default: axios } = require("axios");
const { default: settings } = require("../../../settings");

const confirmLogout = (userData) => {
  axios
    .get(`${settings.api.domain}/api/logout`, {
      params: { userID: userData.userID, username: userData.username },
      withCredentials: true,
    })
    .then((res) => {
      switch (res.data.status) {
        case "success":
          window.location.replace("/");
          break;
        case "unauthorized":
          alert(res.data.message);
          window.location.replace("/");
          break;
        case "error":
          alert("오류가 발생하였습니다. " + res.data.message);
          break;
        default:
          alert(res.data.message);
          window.location.reload();
          break;
      }
    })
    .catch((err) => {
      console.log(err.message);
      alert("서버와 통신하는 도중에 오류가 발생하였습니다.");
    });
};

module.exports = confirmLogout;

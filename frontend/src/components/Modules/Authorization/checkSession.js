import axios from "axios";
import settings from "../../../settings";

const checkSession = async (options) => {
  return new Promise((resolve, reject) => {
    var Auth = false;
    var userData = {};

    axios
      .get(`${settings.api.domain}/api/auth`, {
        withCredentials: true,
      })
      .then((res) => {
        switch (res.data.status) {
          case "success":
            Auth = true;

            userData = {
              status: "success",
              userID: res.data?.userID,
              username: res.data?.username,
              gender: res.data?.gender,
            };

            break;

          default:
            Auth = false;
            userData = {
              status: null,
              userID: null,
              username: null,
              gender: null,
            };
            break;
        }
      })

      .catch((err) => {
        console.log("서버와 연결 중 오류가 발생하였습니다. " + err.message);
      })

      .finally(() => {
        resolve({ isAuth: Auth, userData: userData });
      });
  });
};
export { checkSession };

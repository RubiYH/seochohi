import { AccountCircle, Lock, SettingsApplications } from "@mui/icons-material";
import { BottomNavigation, BottomNavigationAction, Paper, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import settings from "../../settings";
import { checkSession } from "../Modules/Authorization/checkSession";
import { switchSessionResult } from "../Modules/Authorization/sessionSwitches";
import Navbar from "../Modules/Navbar/Navbar";
import Account from "./Account";
import GeneralSettings from "./GeneralSettings";
import UserInfo from "./User";

export default function Settings(props) {
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

  useEffect(() => {
    if (!isAuth) return;

    axios
      .get(`${settings.api.domain}/api/getUser`, {
        withCredentials: true,
      })
      .then((res) => {
        switch (res.data.status) {
          case "success":
            setUserInfo(res.data.result);
            break;
          case "error":
            alert("데이터를 불러오는 도중 오류가 발생하였습니다.");
            break;
          default:
            console.log("계정 정보를 불러오는 도중에 오류가 발생하였습니다.");
            break;
        }
      })
      .catch((err) => {
        console.log("서버와 연결 중 오류가 발생하였습니다. " + err.message);
      });
  }, [isAuth]);

  const [userInfo, setUserInfo] = useState({});

  const InfoSpan = (props) => <span>{props?.value !== "null" ? props?.value : "해당 없음"}</span>;

  const [CustomTitle, setCustomTitle] = useState(props?.name);
  const [menuValue, setMenu] = useState(0);

  const EditSpan = (props) => (
    <Typography
      onClick={props?.callback}
      component="a"
      href="#"
      sx={[
        {
          padding: "4px",
          textDecoration: "none",
          color: "#1976D2",
          position: "absolute",
          right: 0,
        },
        { "&:active": { background: "rgba(0,0,0,0.1)" } },
      ]}
    >
      수정
    </Typography>
  );

  //해시태그
  const { hash } = useLocation();

  useEffect(() => {
    switch (hash.toLowerCase()) {
      case "#my":
        setMenu(0);
        break;
      case "#account":
        setMenu(1);
        break;
      case "#general":
        setMenu(2);
        break;
      default:
        break;
    }
  }, [hash]);

  return (
    <>
      {isAuth && (
        <>
          <Navbar type="menu" name={CustomTitle || null} />
          <div className="wrapper top">
            <div className="content column">
              {/* 개인정보 */}
              {menuValue === 0 && (
                <UserInfo userInfo={userInfo} InfoSpan={InfoSpan} EditSpan={EditSpan} />
              )}
              {/* 계정 */}
              {menuValue === 1 && (
                <Account
                  userInfo={userInfo}
                  InfoSpan={InfoSpan}
                  userData={userData}
                  EditSpan={EditSpan}
                />
              )}
              {/* 일반 설정 */}
              {menuValue === 2 && (
                <GeneralSettings
                  userInfo={userInfo}
                  InfoSpan={InfoSpan}
                  EditSpan={EditSpan}
                  data={props?.data}
                />
              )}
            </div>
          </div>
          {/* 하단 네비바 */}
          <Paper sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }} elevation={3}>
            <BottomNavigation
              showLabels
              value={menuValue}
              onChange={(e, n) => {
                setMenu(n);
              }}
            >
              <BottomNavigationAction label="개인정보" icon={<AccountCircle />} disableRipple />
              <BottomNavigationAction label="내 계정" icon={<Lock />} disableRipple />
              <BottomNavigationAction
                label="일반 설정"
                icon={<SettingsApplications />}
                disableRipple
              />
            </BottomNavigation>
          </Paper>
        </>
      )}
    </>
  );
}

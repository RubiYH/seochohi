import { useState } from "react";
import { useMediaQuery } from "react-responsive";
import { MediaQuery } from "../Modules/MediaQuery";
import AccountMain from "./Components/AccountMain";
import ManageSessions from "./Components/ManageSessions";

export default function Account(props) {
  //responsive : Setting
  const SettingLayout = useMediaQuery({
    query: MediaQuery("Setting"),
  });

  const userInfo = props?.userInfo || null;
  const InfoSpan = props?.InfoSpan;
  const userData = props?.userData;
  const EditSpan = props?.EditSpan;

  //메뉴
  const [menu, setMenu] = useState("main");

  //exports
  const exportData = {
    menu,
    setMenu,
    userInfo,
    InfoSpan,
    userData,
    EditSpan,
    SettingLayout,
  };

  return (
    <>
      {/* 메인 메뉴 */}
      {(menu === "main" || !menu) && <AccountMain data={exportData} />}
      {/* 세션 관리 */}
      {menu === "manageSessions" && <ManageSessions data={exportData} />}
    </>
  );
}

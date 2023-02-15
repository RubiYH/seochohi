import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import settings from "../../../settings";
import Navbar from "../../Modules/Navbar/Navbar";
import ByEmail from "./byEmail";
import ByPhone from "./byPhone";
import ChooseVerify from "./chooseVerify";

export default function VerifyLogin(props) {
  const params = useLocation().search;
  const rt = new URLSearchParams(params).get("t");

  const [status, setStatus] = useState(null);

  const [email, setEmail] = useState(null);
  const [username, setUsername] = useState(null);
  const [phone, setPhone] = useState(null);
  const [Type, setType] = useState(null);
  const [showComp, setComp] = useState(null);

  const exportData = {
    email,
    setEmail,
    username,
    setUsername,
    phone,
    setPhone,
    Type,
    setType,
    showComp,
    setComp,
    continueVerify,
  };

  useEffect(() => {
    axios
      .get(`${settings.api.domain}/api/init/verify`, {
        params: { rt: rt },
        withCredentials: true,
      })
      .then((res) => {
        switch (res.data.status) {
          case "expired":
            setStatus("expired");

            alert(res.data.message);
            window.history.go(-1);
            break;

          case "success":
            setStatus("success");

            let email = res.data?.email;

            if (email !== null) {
              setEmail({
                raw: email,
                ID: email?.split("@")[0] || null,
                Domain: email?.split("@")[1] || null,
              });
            } else {
              setEmail(null);
            }

            let phone = res.data?.phone;

            if (phone !== null) {
              setPhone(phone);
            } else {
              setPhone(null);
            }
            setUsername(res.data.username);
            break;

          case "unauthorized":
            setStatus("unauthorized");

            alert(res.data.message);
            window.location.replace("/");
            break;

          default:
            setStatus("error");

            alert(res.data.message);
            window.history.go(-1);
            break;
        }
      });
  }, []);

  function continueVerify() {
    if (Type === null) return alert("인증 방식 중 하나를 선택해주세요.");
  }

  return (
    <>
      <Navbar type="onlyback" name={props?.name} />
      <div className="wrapper top">
        <div className="content column left">
          {status === "success" && (
            <>
              {showComp === null && <ChooseVerify data={exportData} />}
              {showComp === "byEmail" && <ByEmail data={exportData} />}
              {showComp === "byPhone" && <ByPhone data={exportData} />}
            </>
          )}
        </div>
      </div>
    </>
  );
}

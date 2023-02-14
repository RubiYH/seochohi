import { Card } from "@mui/material";
import axios from "axios";
import DOMPurify from "dompurify";
import { useEffect, useState } from "react";
import settings from "../../settings";
import Navbar from "../Modules/Navbar/Navbar";
import styles from "./Announcement.module.css";

export default function Announcement(props) {
  const [NoticeData, setND] = useState(null);

  const sanitizer = DOMPurify.sanitize;
  useEffect(() => {
    axios.get(`${settings.api.domain}/api/getNotice`).then((res) => {
      switch (res.data.status) {
        case "success":
          setND(res.data?.data[0]);
          break;
        default:
          alert("공지를 불러오는 도중에 오류가 발생하였습니다.");
          window.location.replace("/");
          break;
      }
    });
  }, []);

  return (
    <>
      <Navbar type="back" name={props?.name} />
      <div className="wrapper top">
        <div className="content community">
          {NoticeData && (
            <>
              <div className={styles.title}>
                [{NoticeData?.time}] {NoticeData?.title}
              </div>
              <br />
              <Card
                className={styles.content}
                dangerouslySetInnerHTML={{
                  __html: sanitizer(NoticeData?.description),
                }}
              ></Card>
            </>
          )}
        </div>
      </div>
    </>
  );
}

import { ArrowDropDown, ArrowDropUp } from "@mui/icons-material";
import { Box, Card, Collapse, Grid } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import settings from "../../settings";
import Navbar from "../Modules/Navbar/Navbar";
import styles from "./Support.module.css";

export default function Support(props) {
  const [FAQ, setFAQ] = useState(null);
  const [open, setOpen] = useState({});

  useEffect(() => {
    axios.get(`${settings.api.domain}/api/getSupportList`).then((res) => {
      switch (res.data.status) {
        case "success":
          setFAQ(res.data?.data);
          break;
        default:
          alert("FAQ 목록을 불러오는 도중 오류가 발생하였습니다.");
          break;
      }
    });
  }, []);

  return (
    <>
      <Navbar type="menu" name={props?.name} />
      <div className="wrapper">
        <div className="content center column">
          <div className={styles.Header}>
            <h1 style={{ fontWeight: 400 }}>FAQ 및 문의</h1>
            <span style={{ fontSize: "0.9rem" }}>
              문제가 있거나 궁금한 점이 있으면 [자주 묻는 질문]을 확인해주세요.
            </span>
            <br />
            <span style={{ fontSize: "0.9rem" }}>
              문제가 해결되지 않을 시 [문의하기]를 확인해주세요.
            </span>
          </div>
          <br />
          <Card className={styles.card}>
            <Box className={`${styles.faqCategory} ${styles.faq}`}>자주 묻는 질문</Box>
            <div className={styles.faqList}>
              {FAQ &&
                Object.entries(FAQ).map(([key, value], i) => (
                  <div className={styles.faqContent} key={i}>
                    <span className={styles.faqTitle}>{key}</span>

                    {Object.entries(value).map(([key, value], i) => (
                      <div
                        className={styles.faqItem}
                        key={i}
                        style={{
                          border: open[key] ? "1.2px solid #bdbdbd" : null,
                        }}
                      >
                        <span
                          className={styles.faqAsk}
                          onClick={() => setOpen({ ...open, [key]: !open[key] })}
                        >
                          Q: {key}
                          {open[key] ? <ArrowDropUp /> : <ArrowDropDown />}
                        </span>

                        <Collapse in={open[key]}>
                          <span className={styles.faqAnswer}>A: {value}</span>
                        </Collapse>
                      </div>
                    ))}
                  </div>
                ))}
            </div>
          </Card>
          <br />
          <Card className={styles.card}>
            <Box className={`${styles.faqCategory} ${styles.contact}`}>문의하기</Box>
            <Grid container>
              <Grid item xs={4} sx={gridStyle}>
                <Button
                  variant="contained"
                  href={`mailto:${settings.email}?subject=[서초하이] 문의사항 - <제목을 입력해주세요>`}
                >
                  문의하기
                </Button>
              </Grid>
              <Grid item xs={4} sx={gridStyle}>
                <Button
                  variant="contained"
                  color="error"
                  href={`mailto:${settings.email}?subject=[서초하이] 오류 신고 - <제목을 입력해주세요>`}
                >
                  오류 신고
                </Button>
              </Grid>
              <Grid item xs={4} sx={gridStyle}>
                <Button
                  variant="contained"
                  color="secondary"
                  href={`mailto:${settings.email}?subject=[서초하이] 새 건의사항 - <제목을 입력해주세요>`}
                >
                  건의하기
                </Button>
              </Grid>
            </Grid>
          </Card>
        </div>
      </div>
      <br />
    </>
  );
}

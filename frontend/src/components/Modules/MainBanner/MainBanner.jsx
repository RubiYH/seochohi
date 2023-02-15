import { CardActionArea, Grid, Paper } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { useMediaQuery } from "react-responsive";
import { Link } from "react-router-dom";
import settings from "../../../settings";
import { MediaQuery } from "../MediaQuery";
import styles from "./MainBanner.module.css";

export default function MainBanner(props) {
  const { isAuth } = props;

  const TabletLayout = useMediaQuery({
    query: MediaQuery("Tablet"),
  });

  const [Banner, setBanner] = useState(null);

  useEffect(() => {
    if (!settings.server.Banner) return;

    axios.get(`${settings.api.domain}/api/getBanner`).then((res) => {
      switch (res.data.status) {
        case "success":
          setBanner(res.data?.data);
          break;
        default:
          setBanner({ status: "error", data: null });
          break;
      }
    });
  }, []);

  return (
    <>
      {Banner && Banner?.enabled && Banner?.status !== "error" && (
        <Grid
          item
          xs={TabletLayout ? 12 : isAuth ? 6 : 12}
          sx={{
            paddingTop: "0 !important",
            paddingBottom: "1rem",
            height: TabletLayout ? null : isAuth ? "calc(var(--paper-height) - 14rem);" : null,
          }}
        >
          <Card>
            <CardActionArea style={{ borderRadius: "var(--paper-radius)" }}>
              <Link to={Banner?.url}>
                <Paper
                  elevation={2}
                  className={styles["banner-container"]}
                  sx={{
                    height: TabletLayout ? null : "calc(var(--paper-height) - 14rem);",
                  }}
                >
                  <img
                    src={`${settings.api.domain}/static/mainbanner${Banner?.imageURL}`}
                    alt=""
                    style={Banner?.imageStyle}
                  />
                  <span style={Banner?.titleStyle}>{Banner?.title}</span>
                  <span style={Banner?.subtitleStyle}>{Banner?.subtitle}</span>
                  <span style={Banner?.periodStyle}>{Banner?.period}</span>
                </Paper>
              </Link>
            </CardActionArea>
          </Card>
        </Grid>
      )}
    </>
  );
}

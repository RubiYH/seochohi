import { List, ListItem, ListItemText } from "@mui/material";
import { forestList, myclassList, timeList, wikiList } from "../Navbar/Menus";
import styles from "./SideMenu.module.css";

export default function SideMenu(props) {
  // Dynamically changing height according to the height of the sidemenu
  /*
  let location = useLocation();

  useEffect(() => {
    if (isDesktopOrLaptop) {
      document.getElementsByClassName("wrapper")[0].style.minHeight =
        document.getElementById("sideMenu").scrollHeight + "px";
    }
  }, [location]);

*/

  return (
    <div className={styles.sideMenu} id="sideMenu">
      <div className={styles.sideMenuItems}>
        <List sx={{ fontSize: "1.1rem" }}>
          <ListItemText primary="서초위키" className={styles.sideMenuHead} />
          {wikiList.map((comp) => (
            <a href={comp.url} key={comp.name}>
              <ListItem>
                <ListItemText primary={`• ${comp.name}`} />
              </ListItem>
            </a>
          ))}
          <ListItemText primary="서초고숲" className={styles.sideMenuHead} />
          {forestList.map((comp) => (
            <a href={comp.url} key={comp.name}>
              <ListItem>
                <ListItemText primary={`• ${comp.name}`} />
              </ListItem>
            </a>
          ))}
          <ListItemText primary="서초타임" className={styles.sideMenuHead} />
          {timeList.map((comp) => (
            <a href={comp.url} key={comp.name}>
              <ListItem>
                <ListItemText primary={`• ${comp.name}`} />
              </ListItem>
            </a>
          ))}
          <ListItemText primary="나의 학급" className={styles.sideMenuHead} />
          {myclassList.map((comp) => (
            <a href={comp.url} key={comp.name}>
              <ListItem>
                <ListItemText primary={`• ${comp.name}`} />
              </ListItem>
            </a>
          ))}
        </List>
      </div>
    </div>
  );
}

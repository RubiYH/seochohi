import { useMediaQuery } from "react-responsive";
import { MediaQuery } from "../../Modules/MediaQuery";

import Navbar from "../../Modules/Navbar/Navbar";

export default function MyClassAssessments(props) {
  //responsive : PC
  const isDesktopOrLaptop = useMediaQuery({
    query: MediaQuery("PC"),
  });

  return (
    <>
      <Navbar type="menu" name={props?.name} />
      <div className="wrapper">
        <div className="content">수행평가</div>
      </div>
    </>
  );
}

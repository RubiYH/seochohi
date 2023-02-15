import Navbar from "../Modules/Navbar/Navbar";
import PrivacyText from "./PrivacyText";

export default function Privacy(props) {
  return (
    <>
      <Navbar type="back" name={props?.name} />

      <div className="wrapper">
        <div className="content">
          <PrivacyText />
        </div>
      </div>
    </>
  );
}

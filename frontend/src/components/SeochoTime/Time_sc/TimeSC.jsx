import Navbar from "../../Modules/Navbar/Navbar";

export default function TimeSC(props) {
  return (
    <>
      <Navbar type="menu" name={props?.name} />
      <div className="wrapper">
        <div className="content">학생회</div>
      </div>
    </>
  );
}

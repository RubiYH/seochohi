import Navbar from "../../Modules/Navbar/Navbar";

export default function MyClassAssessments(props) {
  return (
    <>
      <Navbar type="menu" name={props?.name} />
      <div className="wrapper">
        <div className="content">수행평가</div>
      </div>
    </>
  );
}

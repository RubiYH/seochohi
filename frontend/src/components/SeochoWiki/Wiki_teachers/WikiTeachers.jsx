import Navbar from "../../Modules/Navbar/Navbar";

export default function WikiTeachers(props) {
  return (
    <>
      <Navbar type="menu" name={props?.name} />
      <div className="wrapper">선생님</div>
    </>
  );
}

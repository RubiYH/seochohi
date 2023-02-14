import Navbar from "../../Modules/Navbar/Navbar";

export default function MyClassQuickNotesNew(props) {
  return (
    <>
      <Navbar type="memo" name={props?.name} />
      <div className="wrapper top">
        <div className="content">dd</div>
      </div>
    </>
  );
}

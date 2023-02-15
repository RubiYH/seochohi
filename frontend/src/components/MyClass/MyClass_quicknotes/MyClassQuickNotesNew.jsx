import Navbar from "../../Modules/Navbar/Navbar";

export default function MyClassQuickNotesNew(props) {
  return (
    <>
      <Navbar type="memo" name={props?.name} />
      <div className="wrapper top">
        <div className="content">새 메모</div>
      </div>
    </>
  );
}

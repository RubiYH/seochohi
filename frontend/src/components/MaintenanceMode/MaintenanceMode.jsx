import img from "./maintenance.png";

export default function MaintenanceMode(props) {
  return (
    <div className="wrapper" style={{ padding: 0, height: "100%" }}>
      <h1>서버 점검 중입니다.</h1>
      <span>나중에 다시 시도해주세요.</span>
      <img src={img} alt="" style={{ width: "100%" }} />
    </div>
  );
}

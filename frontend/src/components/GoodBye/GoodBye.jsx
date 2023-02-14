import styles from "./GoodBye.module.css";

export default function GoodBye() {
  return (
    <div className={styles.GB}>
      <h2 style={{ marginTop: 0 }}>서초하이 운영 종료 안내</h2>
      <br />
      <span>
        서초하이는 <strong>1월 18일</strong>자로
        <br /> 운영이 종료될 예정입니다.
      </span>
      <br />
      <span>그동안 서초하이를 이용해주셔서 감사합니다.</span>
    </div>
  );
}

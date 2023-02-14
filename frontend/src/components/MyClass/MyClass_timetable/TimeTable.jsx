import styles from "./MyClassTimeTable.module.css";

export default function TimeTable(props) {
  const timetable = props?.data;

  const days = ["일", "월", "화", "수", "목", "금", "토"];

  const TodayTooltip = () => {
    return <span className={styles.todayTooltip}>오늘</span>;
  };

  const IsToday = (props) => {
    const today = new Date();

    if (today.getDay() === props.n) {
      return (
        <td className={styles.tr_tt} data-istoday={isToday(props.n)}>
          {days[props.n]}
          <TodayTooltip />
        </td>
      );
    } else {
      return (
        <td className={styles.tr_tt} data-istoday={isToday(props.n)}>
          {days[props.n]}
        </td>
      );
    }
  };

  const isToday = (n) => {
    const today = new Date();
    if (today.getDay() === n) {
      return "true";
    } else {
      return "false";
    }
  };

  return (
    <table
      className={styles.timetable}
      style={{
        ...props?.style,
        background:
          localStorage.getItem("theme") === "dark"
            ? "rgba(255, 255, 255, 0.12)"
            : null,
      }}
    >
      <tbody>
        <tr>
          <td>교시</td>
          <IsToday n={1} />
          <IsToday n={2} />
          <IsToday n={3} />
          <IsToday n={4} />
          <IsToday n={5} />
        </tr>
        {timetable?.map((t, i) => (
          <tr key={i}>
            <td>{t["교시"]}</td>

            <td className={styles.tr_tt} data-istoday={isToday(1)}>
              {t["월"]}
            </td>

            <td className={styles.tr_tt} data-istoday={isToday(2)}>
              {t["화"]}
            </td>

            <td className={styles.tr_tt} data-istoday={isToday(3)}>
              {t["수"]}
            </td>

            <td className={styles.tr_tt} data-istoday={isToday(4)}>
              {t["목"]}
            </td>

            <td className={styles.tr_tt} data-istoday={isToday(5)}>
              {t["금"]}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

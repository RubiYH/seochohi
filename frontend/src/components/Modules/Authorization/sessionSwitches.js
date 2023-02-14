const switchSessionResult = (result) => {
  switch (result) {
    case "invalid":
      alert("세션이 유효하지 않습니다. 다시 로그인해주세요.");
      window.location.replace("/login");
      break;

    case "unauthorized":
      window.location.replace("/login");
      break;

    default:
      window.location.replace("/login");
      break;
  }
};

export { switchSessionResult };

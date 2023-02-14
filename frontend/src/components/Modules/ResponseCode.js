function HandleResponse(e) {
  switch (e.response.status) {
    case 429:
      alert(e.response.data);
      window.history.go(-1);
      break;
    default:
      alert("서버와 통신 중에 오류가 발생하였습니다: " + e.response.data);
      break;
  }
}

export { HandleResponse };

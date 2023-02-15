const maxLengthCheck = (e, minLength, maxLength, callback) => {
  return new Promise((resolve, reject) => {
    if (minLength !== null && String(e.target?.value).trim().length <= minLength) {
      resolve({
        status: true,
        message: `최소 ${minLength}자 이상 입력해주세요.`,
      });
      callback(null);
    } else if (String(e.target?.value).trim().length >= maxLength) {
      e.target.value = e.target?.value.slice(0, maxLength);
      resolve({
        status: true,
        message: `최대 ${maxLength}자 이하로 입력해주세요.`,
      });
      callback(null);
    } else {
      if (callback) {
        callback(e.target.value);
      }
      resolve({
        status: false,
        message: null,
      });
    }
  });
};

export { maxLengthCheck };

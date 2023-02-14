const rateLimit = require("express-rate-limit").default;

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: "요청 횟수가 너무 많습니다. 나중에 다시 시도하세요.",
});

module.exports = { limiter };

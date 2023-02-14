require("dotenv").config();

const config = {
  port: process.env.PORT,
  mysql: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  domain: process.env.DOMAIN,
  static_domain: process.env.STATIC_DOMAIN,
  email: {
    email: process.env.EMAIL,
    password: process.env.EMAIL_PWD,
  },
  settings: {
    maxfilesize: "30mb",
    accessTokenDuration: "1y",
  },
  schoolInfo: {
    onExam: false,
  },
};

module.exports = { config };

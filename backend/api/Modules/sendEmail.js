const nodemailer = require("nodemailer");
const config = require("../../config").config;

async function sendEmail(options) {
  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.email.email,
      pass: config.email.password,
    },
  });

  const { to, title, html } = options;
  const emailOptions = {
    to: to,
    subject: title,
    html: html,
  };

  await transport.sendMail(emailOptions).then((r) => {
    console.log(`${r.accepted[0]} : 이메일을 전송하였습니다.`);
  });
}

module.exports = { sendEmail };

const jwt = require("jsonwebtoken");

const privateKey = `-----BEGIN RSA PRIVATE KEY-----
MIICWgIBAAKBgHYB8QIvx+qjl1MnhGoRKJY71Ir+sEanSYnnxTSQGShzysgaGpOD
NJUrTwoVj3dzZT/rJsf/ICxlrMBITjIc2QzTqg1/5ZM8NwSQD1wmq2a3SnfbI3AD
to+kz/0x28ITcOH8L9/bcaKicCWPAJvWtOjchCLOgFzmxOHiKnl0OIRvAgMBAAEC
gYA4sVQU5dmYi0E+7MQ7pMSn8FR69kK/nszAmP1v9C5x9bcdDRVpeuY/J9BQGu2S
yHiDDbjS6mmNisdElTgj8SIA1MTnFYYfh7dFZ+FD0I4pbzSaQ6QPcJFcndmkT5Eg
N5aa9bdhWYZKFhtEZstspPVCxzNs0gptM8o+jMJ95g8ZeQJBAL9UOJ626Oy3LU2m
7kz1p1T5qAeWr+vD1EVEwWoimpDPUvtMO4vsxSpGLNb3pWaZ597ZxUr8UlbESApP
3QY5lTsCQQCd5TAYog7VaHayNbpB7nPHxa5RL2Y7/m5EPxpeaKszL5mm+8xOnH0I
wp252X/QUZSP6d36O37r4rFhyRNY2wpdAkBMSLYygdco2ngTp+UHhkJrXQcjz27g
37l4zMsZGCbsad06GND9HzAVhNlH9IFcAS0z6zwAg84IjkXy5pjHbJoVAkASZaXY
+OjpjKZn1ULCc9ohqLLK2s76poaKhR+5aFCqQh2RCz2e2zTmVGa0RNdTmm3I5uLq
SQxcx6kLT7ZlYAAxAkAZrtl6lGhRMCgsl8hcHvxmZZTHQFG8sEXNnkIucoLzTbnB
Seo52EGMECP5Zii2V5cYid/qE9uVWRVHcx5MRGc0
-----END RSA PRIVATE KEY-----`;
const publicKey = `-----BEGIN PUBLIC KEY-----
MIGeMA0GCSqGSIb3DQEBAQUAA4GMADCBiAKBgHYB8QIvx+qjl1MnhGoRKJY71Ir+
sEanSYnnxTSQGShzysgaGpODNJUrTwoVj3dzZT/rJsf/ICxlrMBITjIc2QzTqg1/
5ZM8NwSQD1wmq2a3SnfbI3ADto+kz/0x28ITcOH8L9/bcaKicCWPAJvWtOjchCLO
gFzmxOHiKnl0OIRvAgMBAAE=
-----END PUBLIC KEY-----`;

function signJWT(payload, expiresIn) {
  return jwt.sign(payload, privateKey, { algorithm: "RS256", expiresIn });
}

function verifyJWT(token) {
  try {
    const decoded = jwt.verify(token, publicKey);
    return { payload: decoded, expired: false };
  } catch (e) {
    return { payload: null, expired: e.message.includes("jwt expired") };
  }
}

module.exports = { signJWT, verifyJWT };

const jwt = require("jsonwebtoken");

const privateKey = `-----PRIVATE KEY GOES HERE-----`;
const publicKey = `-----PUBLIC KEY GOES HERE-----`;

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

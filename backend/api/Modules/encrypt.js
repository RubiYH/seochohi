const cryptoJS = require("crypto-js");

module.exports = function encryptText(text, Original_salt) {
  const salt = Original_salt || cryptoJS.lib.WordArray.random(128 / 8).toString(cryptoJS.enc.Hex);

  const encrypted = cryptoJS
    .PBKDF2(text, cryptoJS.enc.Hex.parse(salt), {
      keySize: 512 / 32,
      iterations: 9837,
    })
    .toString();

  return [salt, encrypted];
};

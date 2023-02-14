const { verifyJWT } = require("./jwt.utils");

module.exports = function getUserID(token) {
  const verifyAccess = verifyJWT(token);

  if (verifyAccess.payload === null) {
    return { userID: null, username: null };
  }

  const { userID, username } = verifyAccess.payload;

  return { userID: userID, username: username };
};

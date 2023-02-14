const { verifyJWT } = require("../utils/jwt.utils");

async function deserializeUser(req, res, next) {
  const accessToken = await req.cookies[".at"];

  if (!accessToken) {
    return next();
  }

  const { payload } = verifyJWT(accessToken);
  if (payload) {
    req.user = payload;
    return next();
  }

  return next();
}

module.exports = { deserializeUser };

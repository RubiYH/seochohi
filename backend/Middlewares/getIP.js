module.exports = function (req, res, next) {
  const parseIp = (req) =>
    req.headers["x-forwarded-for"]?.split(",").shift() ||
    req.socket?.remoteAddress;

  req.getIP = parseIp(req).split(":")[0];
  req.getRawIP = parseIp(req);
  next();
};

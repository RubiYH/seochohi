require("dotenv").config();

module.exports = function MaintenanceMode(req, res, next) {
  if (process.env.MAINTENANCE_MODE === "true") {
    return res.status(503).json({
      status: "unavailable",
      message: "서버 점검 중입니다. 나중에 다시 시도하세요.",
    });
  } else {
    next();
  }
};

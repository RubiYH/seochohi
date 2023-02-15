"use strict";

const express = require("express");
const path = require("path");
const app = express();
const helmet = require("helmet");
const config = require("./config").config;
const glob = require("glob");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { deserializeUser } = require("./api/middleware/deserializeUser");
const useragent = require("express-useragent");
const MaintenanceMode = require("./Middlewares/MaintenanceMode");

app.use((req, res, next) => MaintenanceMode(req, res, next));
app.use(helmet());
app.use(helmet.xssFilter());
app.use(helmet.frameguard({ action: "deny" }));
app.use(helmet.noSniff());
app.use(helmet.dnsPrefetchControl({ allow: true }));
app.use(helmet.hsts({ includeSubDomains: true }));
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.disable("x-powered-by");
app.use(cors({ credentials: true, origin: process.env.DOMAIN.split(",") }));
app.use(useragent.express());

app.use((req, res, next) => {
  process.env.DOMAIN.split(",").forEach((w) => {
    if (w.trim() === req.headers.origin) {
      res.header("Access-Control-Allow-Origin", w);
    }
  });
  next();
});

app.enable("trust proxy");
app.use(cookieParser()); //cookie parser

const bodyParser = require("body-parser");
app.use(bodyParser.json({ limit: config.settings.maxfilesize }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  deserializeUser(req, res, next);
});

//static
app.use("/static", express.static(path.join(__dirname, "/files/storage")));

//load api
glob.sync("./api/*.js").forEach((file) => {
  require(path.resolve(file))(app);
  console.log(`- Loaded API ${file.split("/")[2]}`);
});

//connect to mysql
require("./api/Modules/connectToMysql");

app.use((req, res, next) => {
  res.status(404).json({
    code: 404,
    message: "Not Found",
  });
});

app.listen(config.port, function () {
  console.log(`
  =======================================================
  (!) Server is now listening on ${config.port}
  =======================================================
  `);
});

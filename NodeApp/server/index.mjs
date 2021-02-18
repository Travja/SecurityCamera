// import modules
import express from "express";
import bodyParser from "body-parser";
import routes from "./configurations/routes.js";
import { NODE_ENV, PORT as ENV_PORT } from "./keys.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import multer from "multer";

// gather required frameworks and configurations
const app = express();
const { ConfigRoutes } = routes;

//Engine IO initialize
const Rooms = require("engine.io-rooms");
const engine = require("engine.io");
const port = 5000;
const http = require("http").createServer(app)
var server = engine.attach(http);

// declare port
const PORT = ENV_PORT || 42069;

if (NODE_ENV === "development") {
  app.use(cors());
}

// app setup
app.use(multer().any());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
// spin up configurations
new ConfigRoutes(app);

// client setup and routing
if (NODE_ENV === "production") {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  app.use(express.static("build/client"));
  app.get("*", (req, res) => {
    return res.sendFile(path.join(__dirname, "client/index.html"));
  });
}

// start to listen
app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

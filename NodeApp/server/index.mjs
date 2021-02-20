// import modules
import express from "express";
import bodyParser from "body-parser";
import { NODE_ENV, PORT as ENV_PORT } from "./keys.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import multer from "multer";

// gather required frameworks and configurations
const app = express();

//Engine IO initialize
import Rooms from "engine.io-rooms";
import engine from "engine.io";
import httpServer from "http";
<<<<<<< HEAD
import SQLConfig from "./configurations/SQLConfig.js";
import buildRouting from "dobject-routing";
import general_routes from "./routes/general-routes.js";
=======
>>>>>>> ca6b1e66d9bd0dd6c36b4953329a6f699088de85
const http = httpServer.createServer(app);
var server = engine.attach(http);

// Add rooms functionality
server = Rooms(server);

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
app.use('/api', buildRouting.default([general_routes]));
new SQLConfig();

// client setup and routing
if (NODE_ENV === "production") {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  app.use(express.static("build/client"));
  app.get("*", (req, res) => {
    return res.sendFile(path.join(__dirname, "client/index.html"));
  });
}
let broadcaster;

server.on("error", (e) => console.log(e));
server.on("connection", (socket) => {
  console.log(`${getTime()} Connection: ${socket.id}`);

  socket.on("error", (e) => console.log(e));
  socket.on("close", () => {
    console.log("closing connection");
  });

  socket.on("message", (data) => {
    console.log(data);
    let dataObj = JSON.parse(data);
    console.log("Event: " + dataObj["event"]);

    let exData, id, message;

    switch (data["event"]) {
      case "broadcaster":
        console.log(`${getTime()} Broadcaster: ${socket.id}`);
        broadcaster = socket.id;
        socket.join(broadcaster);
        socket.send(prepareData("broadcaster",null));
        break;

      case "watcher":
        console.log(`${getTime()} Watcher: ${socket.id}`);
        exData = {
          "id":socket.id
        }
        socket.room(broadcaster).send(prepareData("watcher",exData));
        break;

      case "offer":
        console.log(`${getTime()} Offer: ${socket.id}`);
        id = data["id"];
        message = data["message"];
        exData = {
          "id": socket.id,
          "message":message
        }
        socket.join(id);
        socket.room(id).send(prepareData("offer",exData));
        break;

      case "answer":
        console.log(`${getTime()} Answer: ${socket.id}`);
        id = data["id"];
        message = data["message"];
        exData = {
          "id": socket.id,
          "message":message
        }
        socket.join(id);
        socket.room(id).send(prepareData("answer",exData));
        break;
      case "candidate":
        console.log(`${getTime()} Candidate: ${socket.id}`);
        id = data["id"];
        message = data["message"];
        exData = {
          "id": socket.id,
          "message":message
        }
        socket.join(id);
        socket.room(id).send(prepareData("candidate",exData));
        break;
      case "disconnect":
        console.log(`${getTime()} Disconnect: ${socket.id}`);
        exData = {
          "id":socket.id
        }
        socket.room(broadcaster).send(prepareData("watcher",exData));
        break;
    }
  });
});

let prepareData = (event, data) => {
  let encodedData = {
    event: event,
  };
  encodedData = { ...encodedData, ...data };
  return JSON.stringify(encodedData);
};

function getTime() {
  let date = new Date();
  return `${date.getMinutes()}:${date.getSeconds()}`;
}

// start to listen
app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

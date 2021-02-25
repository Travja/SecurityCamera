// import modules
import express from "express";
import bodyParser from "body-parser";
import {NODE_ENV, PORT as ENV_PORT} from "./keys.js";
import path, {dirname} from "path";
import {fileURLToPath} from "url";
import cors from "cors";
import multer from "multer";
//Engine IO initialize
import engine from "engine.io";
import httpServer from "http";
// import SQLConfig from "./configurations/SQLConfig.js";
import buildRouting from "dobject-routing";
import general_routes from "./routes/general-routes.js";
import SQLConfig from "./configurations/SQLConfig.js";

// gather required frameworks and configurations
const app = express();

// declare port
const PORT = ENV_PORT || 42069;

if (NODE_ENV === "development") {
    app.use(cors());
}

// app setup
app.use(multer().any());
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true}));
// spin up configurations
app.use('/api', buildRouting.default([general_routes]));
new SQLConfig();

const __dirname = dirname(fileURLToPath(import.meta.url));
app.get("/broadcast", (req, res) => res.sendFile(path.join(__dirname, "socket_clients/broadcast.html")));
app.get("/watcher", (req, res) => res.sendFile(path.join(__dirname, "socket_clients/index.html")));
app.get("/watch.js", (req, res) => res.sendFile(path.join(__dirname, "socket_clients/watch.js")));
app.get("/broadcast.js", (req, res) => res.sendFile(path.join(__dirname, "socket_clients/broadcast.js")));
app.get("/engine.io.js", (req, res) => res.sendFile(path.join(__dirname, "socket_clients/engine.io.js")));
// client setup and routing
if (NODE_ENV === "production") {
    app.use(express.static("build/client"));
    app.get("*", (req, res) => {
        return res.sendFile(path.join(__dirname, "client/index.html"));
    });
}
let broadcaster;

const http = httpServer.createServer(app);
let server = engine.attach(http);

// Add rooms functionality
let sockets = [];

server.on("error", (e) => console.log(e));
server.on("connection", (socket) => {
    sockets.push(socket);
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

        switch (dataObj["event"]) {
            case "room":
                socket.room = dataObj.room_id;
                console.log(socket.room);
                break;
            case "broadcaster":
                console.log(`${getTime()} Broadcaster: ${socket.id}`);
                broadcaster = socket.id;
                broadcast(prepareData("broadcaster", null));
                break;

            case "watcher":
                console.log(`${getTime()} Watcher: ${socket.id}`);
                exData = {
                    "id": socket.id
                }
                broadcast(prepareData("watcher", exData));
                break;

            case "offer":
                console.log(`${getTime()} Offer: ${socket.id}`);
                id = data["id"];
                message = data["message"];
                exData = {
                    "id": socket.id,
                    "message": message
                }
                broadcast(prepareData("offer", exData));
                break;

            case "answer":
                console.log(`${getTime()} Answer: ${socket.id}`);
                id = data["id"];

                message = data["message"];
                exData = {
                    "id": socket.id,
                    "message": message
                }
                broadcast(prepareData("answer", exData));
                break;
            case "candidate":
                console.log(`${getTime()} Candidate: ${socket.id}`);
                id = data["id"];
                message = data["message"];
                exData = {
                    "id": socket.id,
                    "message": message
                }
                broadcast(prepareData("candidate", exData));
                break;
            case "disconnect":
                console.log(`${getTime()} Disconnect: ${socket.id}`);
                exData = {
                    "id": socket.id
                }
                broadcast(prepareData("watcher", exData));
                break;
            case "ping":
                console.log("Got ping!");
                broadcast(prepareData("ping", {message: "ping"}));
                break;
        }
    });
});

let broadcast = (data) => {
    for (let sock of sockets) {
        sock.send(data);
    }
};

let broadcastRoom = (room, data) => {
    for (let sock of sockets) {
        if (sock.room == room) {
            sock.send(data);
        }
    }
};

let prepareData = (event, data) => {
    let encodedData = {
        event: event,
    };
    encodedData = {...encodedData, ...data};
    return JSON.stringify(encodedData);
};

function getTime() {
    let date = new Date();
    return `${date.getMinutes()}:${date.getSeconds()}`;
}

// start to listen
http.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
// http.listen(5000, () => console.log("Websocket server listening on port: 5000"));

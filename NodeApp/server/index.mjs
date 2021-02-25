// import modules
import express from "express";
import bodyParser from "body-parser";
import {NODE_ENV, PORT as ENV_PORT} from "./keys.js";
import path, {dirname} from "path";
import {fileURLToPath} from "url";
import cors from "cors";
import multer from "multer";
import {Server} from "socket.io";
//Engine IO initialize
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
app.get("/socket.io.js", (req, res) => res.sendFile(path.join(__dirname, "socket_clients/socket.io.js")));
// client setup and routing
if (NODE_ENV === "production") {
    app.use(express.static("build/client"));
    app.get("*", (req, res) => {
        return res.sendFile(path.join(__dirname, "client/index.html"));
    });
}

let broadcaster;
const http = httpServer.createServer(app);
const io = new Server(http);

io.sockets.on("error", e => console.log(e));
io.sockets.on("connection", socket => {

    socket.on("broadcaster", () => {
        broadcaster = socket.id;
        socket.broadcast.emit("broadcaster");
    });
    socket.on("watcher", () => {
        socket.to(broadcaster).emit("watcher", socket.id);
    });
    socket.on("offer", (id, message) => {
        socket.to(id).emit("offer", socket.id, message);
    });
    socket.on("answer", (id, message) => {
        socket.to(id).emit("answer", socket.id, message);
    });
    socket.on("candidate", (id, message) => {
        socket.to(id).emit("candidate", socket.id, message);
    });
    socket.on("disconnect", () => {
        socket.to(broadcaster).emit("disconnectPeer", socket.id);
    });
});

// start to listen
http.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
// http.listen(5000, () => console.log("Websocket server listening on port: 5000"));

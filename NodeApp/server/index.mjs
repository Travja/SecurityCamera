// import modules
import express from "express";
import bodyParser from "body-parser";
import { NODE_ENV, PORT as ENV_PORT } from "./keys.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import multer from "multer";
import { Server } from "socket.io";
//Engine IO initialize
import httpServer from "http";
import buildRouting from "dobject-routing";
import general_routes from "./routes/general-routes.js";
import SQLConfig from "./configurations/SQLConfig.js";
import { Readable } from "stream";
import { useSql } from "./configurations/SQLConfig.js";
import bcrypt from "bcryptjs";
import fs from "fs";
let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        fs.mkdirSync("./uploads/profiles/", { recursive: true });
        cb(null, './uploads/profiles/')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
let upload = multer({ storage: storage });

// gather required frameworks and configurations
const app = express();

// declare port
const PORT = ENV_PORT || 42069;

if (NODE_ENV === "development") {
    app.use(cors());
}

// app setup
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
// spin up configurations
app.use('/api', buildRouting.default([general_routes]));
new SQLConfig();

const __dirname = dirname(fileURLToPath(import.meta.url));
// Setup some paths for testing
app.get("/broadcast", (req, res) => res.sendFile(path.join(__dirname, "socket_clients/broadcast.html")));
app.get("/watcher", (req, res) => res.sendFile(path.join(__dirname, "socket_clients/index.html")));
app.get("/watch.js", (req, res) => res.sendFile(path.join(__dirname, "socket_clients/watch.js")));
app.get("/broadcast.js", (req, res) => res.sendFile(path.join(__dirname, "socket_clients/broadcast.js")));
app.get("/socket.io.js", (req, res) => res.sendFile(path.join(__dirname, "socket_clients/socket.io.js")));
// Create the uploads route
app.use("/uploads", express.static('uploads'));
app.post("/api/account", upload.single('picture'), async (req, res, next) => {
    const { password } = req.body;
    if (!req.name) req.name = "";
    const hash = bcrypt.hashSync(password, bcrypt.genSaltSync(11));
    let request = await (await useSql()).request();
    let result = await request.query`insert into [User] (Email, Name, Hash) values (${req.body.email}, ${req.body.name}, ${hash}); select SCOPE_IDENTITY() AS id`;
    if (req.file) {
        let updatReq = await (await useSql()).request();
        updatReq.query`update [User] set Picture=${'/uploads/profiles/' + req.file.filename} where [User].UserID=${result.recordset[0].id}`
    }

    return res.redirect("/login");
});
// client setup and routing
if (NODE_ENV === "production") {
    app.use(express.static("build/client"));
    app.get("*", (req, res) => {
        return res.sendFile(path.join(__dirname, "client/index.html"));
    });
}

const http = httpServer.createServer(app);
const io = new Server(http);

let socketsRoom = {};

io.sockets.on("error", e => console.log(e));
io.sockets.on("connection", socket => {

    socket.on('join', (roomId) => {

        console.log(`Joining room ${roomId} and emitting room_joined socket event`);
        socket.join(roomId);

        if (socketsRoom[socket.id]) return;

        console.log("socket added to the list");
        socketsRoom[socket.id] = roomId;
        console.log(socketsRoom);
    });

    socket.on("broadcaster", (roomId) => {
        console.log("Broadcaster: ", socket.id);
        socket.to(roomId).emit("broadcaster");
    });

    socket.on("watcher", (roomId) => {
        console.log("Watcher: " + socket.id);
        socket.to(roomId).emit("watcher", socket.id);
    });
    socket.on("offer", (id, message, roomId) => {
        socket.to(id).emit("offer", socket.id, message);
    });
    socket.on("answer", (id, message, roomId) => {
        socket.to(id).emit("answer", socket.id, message);
    });
    socket.on("candidate", (id, message, roomId, isBroadcaster) => {
        // console.log("Got candidate");
        socket.to(id).emit("candidate", socket.id, message, isBroadcaster);
    });
    socket.on("disconnect", () => {
        const roomId = socketsRoom[socket.id] || "";
        console.log("disconnect from room: ", roomId);
        socket.to(roomId).emit("disconnectPeer", socket.id);
        if(socketsRoom[socket.id])
            delete socketsRoom[socket.id];
    });
});
// start to listen
http.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
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
import buildRouting from "dobject-routing";
import general_routes from "./routes/general-routes.js";
import SQLConfig from "./configurations/SQLConfig.js";
import { Readable} from "stream";

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

const boundary = "gc0p4Jq0M2Yt08jU534c0p";

// must be implemented using a stream
// Otherwise res will close early
// The implementation of the readable stream, please refer to: https://nodejs.org/api/stream.html#stream_implementing_a_readable_stream
let img = "";
let fps = 5;
class MockStream extends Readable {
    constructor(opts) {
        super(opts)
    }
    async _read(number) {
        const buffer = Buffer.concat([
            new Buffer(`--${boundary}\r\n`),
            new Buffer("Content-Type: image/jpeg\r\n\r\n"),
            new Buffer(img, 'base64')
        ]);
        setTimeout(() => {
            this.push(buffer);
        }, 1000 / fps);
    }
}

app.get("/test", (req, res) => {
    res.writeHead(200, {
        "Content-Type": `multipart/x-mixed-replace; boundary="${boundary}"`
    });
    const stream = new MockStream();
    stream.pipe(res);
});

app.get("/broadcast", (req, res) => res.sendFile(path.join(__dirname, "socket_clients/broadcast.html")));
app.get("/watcher", (req, res) => res.sendFile(path.join(__dirname, "socket_clients/index.html")));
app.get("/watch.js", (req, res) => res.sendFile(path.join(__dirname, "socket_clients/watch.js")));
app.get("/broadcast.js", (req, res) => res.sendFile(path.join(__dirname, "socket_clients/broadcast.js")));
app.get("/socket.io.js", (req, res) => res.sendFile(path.join(__dirname, "socket_clients/socket.io.js")));
// client setup and routing
if (NODE_ENV === "production") {
    app.use(express.static("build/client"));
    app.get("*", (req, res) => {
        return res.sendFile(path.join(__dirname, "client/index.html"));
    });
}


let broadcasters = {};
let watchers = {};
let sockets = [];
let socketEmails = {};

const getEmail = (socket_id) => {
    return socketEmails[socket_id];
};

const getSocket = (socket_id) => {
    for (let socket of sockets) {
        if (socket.id == socket_id) {
            return socket;
        }
    }
    return null;
};

const http = httpServer.createServer(app);
const io = new Server(http);
io.on("error", e => console.log(e));
io.on("connection", socket => {
    console.log("New connection");
    sockets.push(socket);

    socket.onAny((name, ...args) => {
        // if (name != "frame")
        console.log("Got " + name + " event");
    });

    socket.on("broadcaster", (email) => {
        console.log("Got broadcaster");
        console.log(socket.id);
        console.log("Email: " + email);
        if (broadcasters[email])
            broadcasters[email].push(socket.id);

        socketEmails[socket.id] = email;

        if (watchers[email]) {
            watchers[email].forEach(id => {
                let sock = getSocket(id);
                sock.emit("peers", broadcasters[email]);
            });
        }
    });

    socket.on("watcher", (email) => {
        socketEmails[socket.id] = email;
        if (watchers[email])
            watchers[email].push(socket.id);
        socket.emit("peers", broadcasters[email]);
    });

    socket.on("connectionRequest", (socket_id) => {
        let broadcaster = getSocket(socket_id);
        if (!broadcaster) return;

        if (!broadcaster.peers)
            broadcaster.peers = [];
        broadcaster.peers.push(socket.id);

        //Filter so we only have one outbound request to the socket at a time.
        for (let bc in broadcasters) {
            for (let caster of broadcasters[bc]) {
                if (caster.peers)
                    caster.peers = caster.peers.filter(peer => peer != socket.id);
            }
        }
    });

    socket.on("frame", (frame, timestamp) => {
        // if (!socket.peers) return;
        // socket.peers.forEach(id => {
        //TODO change this back.
        console.log("delay to server: " + (Date.now() - timestamp));
        sockets.forEach(sock => {
            // let sock = getSocket(id);
            img = frame;
            sock.emit("frame", frame, timestamp);
        });
    });

    socket.on("disconnect", () => {
        let email = getEmail(socket.id);

        if (email && broadcasters[email])
            broadcasters[email] = broadcasters[email].filter(sock => sock != socket.id);

        if (email && watchers[email])
            watchers[email] = watchers[email].filter(sock => sock != socket.id);


        sockets = sockets.filter(sock => sock != socket);
        delete socketEmails[socket.id];
        console.log("Removed socket " + socket.id + " from memory");
    });
});

// start to listen
http.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
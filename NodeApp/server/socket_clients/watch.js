const peerConnections={};
const config = {
    iceServers: [
        {
            urls: 'stun:stunserver.org:3478'
        },
        {
            url: 'turn:numb.viagenie.ca',
            username: 'ypatel@student.neumont.edu',
            credential: 'Camera_yp'
        }
    ]
};

let roomId = "yes";
let streams = [];
const socket = io.connect();
const video = document.getElementById("vid");
const video2 = document.getElementById("vid2");
const enableAudioButton = document.querySelector("#enable-audio");

console.log("URI WINDOW: " + window.location.origin)

enableAudioButton.addEventListener("click", enableAudio)

socket.on("offer", (id, description) => {
    peerConnections[id] = new RTCPeerConnection(config);
    try {
        description = JSON.parse(description);
    } catch (e) {
        console.log("Supplied description is already a json object");
    }
    console.log(description);
    peerConnections[id]
        .setRemoteDescription(description)
        .then(() => peerConnections[id].createAnswer())
        .then(sdp => peerConnections[id].setLocalDescription(sdp))
        .then(() => {
            socket.emit("answer", id, peerConnections[id].localDescription, roomId);
        });

    peerConnections[id].ontrack = event => {
        console.log("trackEvent", event);
        console.log("pushing a stream")
        streams.push(event.streams[0]);
        console.log("no. of streams", streams.length);
        video.srcObject = event.streams[0];
        if (streams > 3) {
            video2.srcObject = event.streams[3];
        }
        console.log("Streams:",streams);
        console.log("PeerConnections", peerConnections);
    };
    peerConnections[id].onicecandidate = event => {
        if (event.candidate) {
            socket.emit("candidate", id, event.candidate, roomId, false);
        }
    };
});

socket.on("candidate", (id, candidate, isBroadcaster) => {
    if (isBroadcaster) {
        try {
            candidate = JSON.parse(candidate);
        } catch (e) {
            console.log("Supplied candidate is already a json object");
        }
        console.log(candidate);
        peerConnections[id]
            .addIceCandidate(new RTCIceCandidate(candidate))
            .then(() => {console.log("ice candidate added.")})
            .catch(e => console.error(e));
    }
});

socket.on("connect", () => {
    socket.emit("join", roomId);
    socket.emit("watcher", roomId);
});

socket.on("broadcaster", () => {
    socket.emit("watcher", roomId);
});

window.onunload = window.onbeforeunload = () => {
    socket.close();
    for (let peerConnection in peerConnections) {
        peerConnections[peerConnection].close();
    }
};

function enableAudio() {
    console.log("Enabling audio")
    video.muted = false;
}


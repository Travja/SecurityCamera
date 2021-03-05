let peerConnection;
const config = {
    iceServers: [
        {
            urls: "stun:stunserver.org:3478"
        },
        {
            url: 'turn:numb.viagenie.ca',
            username: 'ypatel@student.neumont.edu',
            credential: 'Camera_yp'
        }
    ]
};

const socket = io.connect();
const video = document.querySelector("video");
const enableAudioButton = document.querySelector("#enable-audio");

console.log("URI WINDOW: " + window.location.origin)

enableAudioButton.addEventListener("click", enableAudio)

socket.on("offer", (id, description) => {
    peerConnection = new RTCPeerConnection(config);
    try {
        description = JSON.parse(description);
    } catch (e) {
        console.log("Supplied description is already a json object");
    }
    console.log(description);
    peerConnection
        .setRemoteDescription(description)
        .then(() => peerConnection.createAnswer())
        .then(sdp => peerConnection.setLocalDescription(sdp))
        .then(() => {
            socket.emit("answer", id, peerConnection.localDescription);
        });
    peerConnection.ontrack = event => {
        video.srcObject = event.streams[0];
    };
    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            socket.emit("candidate", id, event.candidate);
        }
    };
});


socket.on("candidate", (id, candidate) => {
    try {
        candidate = JSON.parse(candidate);
    } catch (e) {
        console.log("Supplied candidate is already a json object");
    }
    console.log(candidate);
    peerConnection
        .addIceCandidate(new RTCIceCandidate(candidate))
        .catch(e => console.error(e));
});

socket.on("connect", () => {
    socket.emit("watcher");
});

socket.on("broadcaster", () => {
    socket.emit("watcher");
});

window.onunload = window.onbeforeunload = () => {
    socket.close();
    peerConnection.close();
};

function enableAudio() {
    console.log("Enabling audio")
    video.muted = false;
}


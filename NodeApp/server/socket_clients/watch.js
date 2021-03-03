let peerConnection;
const config = {
    iceServers: [
        {
            "urls": "stun:stun.l.google.com:19302",
        },
        // {
        //   "urls": "turn:TURN_IP?transport=tcp",
        //   "username": "TURN_USERNAME",
        //   "credential": "TURN_CREDENTIALS"
        // }
    ]
};

const socket = io.connect(window.location.origin);
const video = document.getElementById("frame");
// const enableAudioButton = document.querySelector("#enable-audio");

// enableAudioButton.addEventListener("click", enableAudio)

// socket.emit("watcher", );

socket.on("connect", () => {
    console.log("Established socket connection");
});

socket.on("peers", (peers) => {
    //TODO Offer the user which peer to connect to

});

socket.on("frame", (frame, timestamp) => {
    console.log("Got frame. Total delay to client: " + (new Date().getMilliseconds() - timestamp));
    video.src = frame;
});

// socket.on("offer", (id, description) => {
//     peerConnection = new RTCPeerConnection(config);
//     try {
//         description = JSON.parse(description);
//     } catch (e) {
//         console.log("Supplied description is already a json object");
//     }
//     console.log(description);
//     peerConnection
//         .setRemoteDescription(description)
//         .then(() => peerConnection.createAnswer())
//         .then(sdp => peerConnection.setLocalDescription(sdp))
//         .then(() => {
//             socket.emit("answer", id, peerConnection.localDescription);
//         });
//     peerConnection.ontrack = event => {
//         video.srcObject = event.streams[0];
//     };
//     peerConnection.onicecandidate = event => {
//         if (event.candidate) {
//             socket.emit("candidate", id, event.candidate);
//         }
//     };
// });
//
//
// socket.on("candidate", (id, candidate) => {
//     try {
//         candidate = JSON.parse(candidate);
//     } catch (e) {
//         console.log("Supplied candidate is already a json object");
//     }
//     console.log(candidate);
//     peerConnection
//         .addIceCandidate(new RTCIceCandidate(candidate))
//         .catch(e => console.error(e));
// });
//
// socket.on("connect", () => {
//     socket.emit("watcher");
// });
//
// socket.on("broadcaster", () => {
//     socket.emit("watcher");
// });

window.onunload = window.onbeforeunload = () => {
    socket.close();
    peerConnection.close();
};

function enableAudio() {
    console.log("Enabling audio")
    video.muted = false;
}


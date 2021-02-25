let peerConnection;
const config = {
    iceServers: [
        {
            urls: "stun:stun.l.google.com:19302",
        },
        // {
        //   "urls": "turn:TURN_IP?transport=tcp",
        //   "username": "TURN_USERNAME",
        //   "credential": "TURN_CREDENTIALS"
        // }
    ],
};

const socket = new eio.Socket("ws://" + window.location.hostname + (window.location.port != "" ? (":" + window.location.port) : ""));
const video = document.querySelector("video");
const enableAudioButton = document.querySelector("#enable-audio");

enableAudioButton.addEventListener("click", enableAudio);

prepareData = (e, data) => {
    let encodedData = {
        event: e,
    };
    encodedData = {...encodedData, ...data};
    return JSON.stringify(encodedData);
};

socket.on("open", () => {

    socket.send(prepareData("watcher", null));

    console.log("Inside watch connect");
    console.log(socket.id);

    let exData, id, message;

    socket.send(prepareData("room", {room_id: "room1"}));

    socket.on("message", (data) => {

        console.log(data);
        data = JSON.parse(data);

        switch (data["event"]) {

            case "offer":

                id = data["id"];
                message = data["message"];
                console.log("Inside watch offer");
                console.log(message);
                peerConnection = new RTCPeerConnection(config);
                peerConnection
                    .setRemoteDescription(message)
                    .then(() => peerConnection.createAnswer())
                    .then((sdp) => peerConnection.setLocalDescription(sdp))
                    .then(() => {
                        console.log("Inside watch answer");
                        exData = {
                            id: id,
                            message: peerConnection.localDescription
                        }
                        socket.send(prepareData("answer", exData));
                    });
                peerConnection.ontrack = event => {
                    video.srcObject = event.streams[0];
                };
                peerConnection.onicecandidate = event => {
                    if (event.candidate) {
                        console.log("Inside watch candidate");
                        exData = {
                            id: id,
                            message: event.candidate,
                        };
                        let sendData = prepareData("candidate", exData);
                        socket.send(sendData);
                    }
                };
                break;

            case "wcandidate":
                console.log("Inside watch socket candidate");
                id = data["id"];
                message = data["message"];
                peerConnection
                    .addIceCandidate(new RTCIceCandidate(message))
                    .catch((e) => console.error(e));
                break;

            case "broadcaster":
                console.log("Inside watch broadcaster");
                socket.send(prepareData("watcher", null));
                break;
        }
    });
});

function getTime() {
    var date = new Date();
    return `${date.getMinutes()}:${date.getSeconds()}`;
}


window.onunload = window.onbeforeunload = () => {
    socket.close();
    peerConnection.close();
};

function enableAudio() {
    console.log("Enabling audio");
    video.muted = false;
}

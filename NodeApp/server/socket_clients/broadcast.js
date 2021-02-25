const peerConnections = {};
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

const socket = io("ws://localhost:42069");

console.log("URI WINDOW: " + window.location.origin);

socket.on("error", (e) => console.log(e));

prepareData = (event, data) => {
    let encodedData = {
        event: event,
    };
    encodedData = { ...encodedData, ...data };
    return JSON.stringify(encodedData);
};

socket.on("open", () => {
    console.log(`Connection: ${socket.id}`);

    socket.send(prepareData("room", {room_id: "room1"}));

    let exData,id,message;

    socket.on("message", (data) => {

        console.log(data);
        data = JSON.parse(data);

        switch (data["event"]) {

            case "answer":
                console.log(`${getTime()} Answer: ${socket.id}`);
                id = data["id"];
                message = data["message"];
                peerConnections[id].setRemoteDescription(message);
                break;

            case "watcher":
                console.log(`${getTime()} Watcher: ${socket.id}`);
                id = data["id"];
                console.log("before rtc")
                const peerConnection = new RTCPeerConnection(config);
                peerConnections[id] = peerConnection;

                let stream = videoElement.srcObject;
                stream
                    .getTracks()
                    .forEach((track) => peerConnection.addTrack(track, stream));

                peerConnection.onicecandidate = (event) => {
                    if (event.candidate) {
                        console.log("Inside candidate");
                        exData = {
                            id: id,
                            message: event.candidate,
                        };
                        let sendData = prepareData("bcandidate", exData);
                        socket.send(sendData);
                    }
                };

                peerConnection
                    .createOffer()
                    .then((sdp) => peerConnection.setLocalDescription(sdp))
                    .then(() => {
                        console.log("Inside offer");
                        exData = {
                            id: id,
                            message: peerConnection.localDescription,
                        };
                        let sendData = prepareData("offer", exData);
                        socket.send(sendData);
                    });

                break;

            case "candidate":
                id = data["id"];
                message = data["candidate"];
                console.log("Inside socket candidate");
                peerConnections[id].addIceCandidate(new RTCIceCandidate(message));
                break;

            case "disconnectPeer":
                id = data["id"];
                peerConnections[id].close();
                delete peerConnections[id];
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
};

// Get camera and microphone
const videoElement = document.querySelector("video");
const audioSelect = document.querySelector("select#audioSource");
const videoSelect = document.querySelector("select#videoSource");

audioSelect.onchange = getStream;
videoSelect.onchange = getStream;

getStream().then(getDevices).then(gotDevices);

function getDevices() {
    return navigator.mediaDevices.enumerateDevices();
}

function gotDevices(deviceInfos) {
    window.deviceInfos = deviceInfos;
    for (const deviceInfo of deviceInfos) {
        const option = document.createElement("option");
        option.value = deviceInfo.deviceId;
        if (deviceInfo.kind === "audioinput") {
            option.text = deviceInfo.label || `Microphone ${audioSelect.length + 1}`;
            audioSelect.appendChild(option);
        } else if (deviceInfo.kind === "videoinput") {
            option.text = deviceInfo.label || `Camera ${videoSelect.length + 1}`;
            videoSelect.appendChild(option);
        }
    }
}

function getStream() {
    if (window.stream) {
        window.stream.getTracks().forEach((track) => {
            track.stop();
        });
    }
    const audioSource = audioSelect.value;
    const videoSource = videoSelect.value;
    const constraints = {
        audio: { deviceId: audioSource ? { exact: audioSource } : undefined },
        video: { deviceId: videoSource ? { exact: videoSource } : undefined },
    };
    return navigator.mediaDevices
        .getUserMedia(constraints)
        .then(gotStream)
        .catch(handleError);
}

function gotStream(stream) {
    window.stream = stream;
    audioSelect.selectedIndex = [...audioSelect.options].findIndex(
        (option) => option.text === stream.getAudioTracks()[0].label
    );
    videoSelect.selectedIndex = [...videoSelect.options].findIndex(
        (option) => option.text === stream.getVideoTracks()[0].label
    );
    videoElement.srcObject = stream;
    // socket.send("broadcaster");
    socket.send(prepareData("broadcaster",null));
}

function handleError(error) {
    console.error("Error: ", error);
}

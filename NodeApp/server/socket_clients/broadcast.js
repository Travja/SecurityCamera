const peerConnections = {};
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

let roomId;

const socket = io.connect();

console.log("URI WINDOW: " + window.location.origin)

socket.on("answer", (id, description) => {
    peerConnections[id].setRemoteDescription(description).then(r => console.log(r));
});

socket.on("watcher", id => {

    const peerConnection = new RTCPeerConnection(config);
    peerConnections[id] = peerConnection;

    let stream = videoElement.srcObject;
    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            socket.emit("candidate", id, event.candidate, roomId, true);
        }
    };

    peerConnection
        .createOffer()
        .then(sdp => peerConnection.setLocalDescription(sdp))
        .then(() => {
            socket.emit("offer", id, peerConnection.localDescription, roomId);
        });
});

socket.on("candidate", (id, candidate, isBroadcast) => {
    if (!isBroadcast){
        peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
    }
});

socket.on("disconnectPeer", id => {
    peerConnections[id].close();
    delete peerConnections[id];
});

window.onunload = window.onbeforeunload = () => {
    socket.close();
};

// Get camera and microphone
const videoElement = document.querySelector("video");
const audioSelect = document.querySelector("select#audioSource");
const videoSelect = document.querySelector("select#videoSource");
const textEntry = document.getElementById('txtId');
const button = document.getElementById('btnConnect');

function joinRoom(){
    console.log("on click");
    if (textEntry.value !== ""){
        console.log(textEntry.value)
        roomId = textEntry.value;
        getStream()
            .then(getDevices)
            .then(gotDevices);
    }else {
        alert("Please input room id");
    }
}

audioSelect.onchange = getStream;
videoSelect.onchange = getStream;

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
        window.stream.getTracks().forEach(track => {
            track.stop();
        });
    }
    const audioSource = audioSelect.value;
    const videoSource = videoSelect.value;
    const constraints = {
        audio: { deviceId: audioSource ? { exact: audioSource } : undefined },
        video: { deviceId: videoSource ? { exact: videoSource } : undefined }
    };
    return navigator.mediaDevices
        .getUserMedia(constraints)
        .then(gotStream)
        .catch(handleError);
}

function gotStream(stream) {
    window.stream = stream;
    audioSelect.selectedIndex = [...audioSelect.options].findIndex(
        option => option.text === stream.getAudioTracks()[0].label
    );
    videoSelect.selectedIndex = [...videoSelect.options].findIndex(
        option => option.text === stream.getVideoTracks()[0].label
    );
    videoElement.srcObject = stream;

    socket.emit("join", roomId);
    socket.emit("broadcaster", roomId);

}

function handleError(error) {
    console.error("Error: ", error);
}
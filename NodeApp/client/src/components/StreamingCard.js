import { VideoCard } from "./VideoCard";
import Icon from "@mdi/react";
import { Component } from "react";
import io from "socket.io-client";

export default class StreamingCard extends Component {
    socket;
    peerConnection;
    video = <video playsInline autoPlay muted controls height="100%"></video>;
    config = {
        iceServers: [
            {
                urls: process.env.REACT_APP_STUN_URL
            },
            {
                url: process.env.REACT_APP_TURN_URL,
                username: process.env.REACT_APP_TURN_USERNAME,
                credential: process.env.REACT_APP_TURN_CREDENTIAL
            }
        ]
    };
    
    constructor(props) {
        super(props);
        this.socket = io.connect();

        this.socket.on("offer", (id, description) => {
            this.peerConnection = new RTCPeerConnection(this.config);
            try {
                description = JSON.parse(description);
            } catch (e) {
                console.log("Supplied description is already a json object");
            }
            console.log(description);
            this.peerConnection
                .setRemoteDescription(description)
                .then(() => this.peerConnection.createAnswer())
                .then(sdp => this.peerConnection.setLocalDescription(sdp))
                .then(() => {
                    this.socket.emit("answer", id, this.peerConnection.localDescription);
                });
            this.peerConnection.ontrack = event => {
                this.video.srcObject = event.streams[0];
            };
            this.peerConnection.onicecandidate = event => {
                if (event.candidate) {
                    this.socket.emit("candidate", id, event.candidate);
                }
            };
        });

        this.socket.on("candidate", (id, candidate) => {
            try {
                candidate = JSON.parse(candidate);
            } catch (e) {
                console.log("Supplied candidate is already a json object");
            }
            console.log(candidate);
            this.peerConnection
                .addIceCandidate(new RTCIceCandidate(candidate))
                .catch(e => console.error(e));
        });

        this.socket.on("connect", () => {
            this.socket.emit("watcher");
        });

        this.socket.on("broadcaster", () => {
            this.socket.emit("watcher");
        });

        window.onunload = window.onbeforeunload = () => {
            this.socket.close();
            this.peerConnection.close();
        };
    }

    render() {
        return(
            <VideoCard VideoComponent={this.video}>
                <div className="streaming-card-content">
                    <p>{this.props.title}</p>
                </div>
            </VideoCard>
        );
    }
}
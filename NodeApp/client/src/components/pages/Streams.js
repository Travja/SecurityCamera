import React, { Component, Fragment } from "react";
import StreamingCard from "../StreamingCard";
import { connect } from "react-redux";
import StreamsAPI from "../../api/Streams";
import io from "socket.io-client";
import AccountAPI from "../../api/Account";

/**
 * Streams page. This is a protected route.
 * To access the logged in user directly: `this.props.user`
 */
class Streams extends Component {
    peerConnections = {};
    config = {
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
    streams = [];

    roomId;
    socket;

    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            streamElements: []
        };
    }

    async componentDidMount() {
        AccountAPI.getAccount((err, account) => {
            if (err) console.log("No account");
            if (account) {
                this.setState({ account: account });
                this.roomId = this.state.account.Email;
                this.mounted = true;
                this.socket = io.connect();
                this.socket.on("offer", (id, description) => {
                    if (this.peerConnections[id]) return;

                    this.peerConnections[id] = new RTCPeerConnection(this.config);
                    try {
                        description = JSON.parse(description);
                    } catch (e) {
                        console.log("Supplied description is already a json object");
                    }
                    console.log(description);
                    this.peerConnections[id]
                        .setRemoteDescription(description)
                        .then(() => this.peerConnections[id].createAnswer()
                            .then(sdp => this.peerConnections[id].setLocalDescription(sdp))
                            .then(() => {
                                this.socket.emit("answer", id, this.peerConnections[id].localDescription, this.roomId);
                            }));

                    this.peerConnections[id].ontrack = event => {
                        if (event.track.kind == "video") {
                            console.log("trackEvent", event);
                            console.log("pushing a stream")
                            this.streams.push({"stream":event.streams[0], "id":id});
                            console.log("no. of streams", this.streams.length);
                            let video = <video playsInline autoPlay muted controls ref={vid => vid.srcObject = event.streams[0]} width="100%"></video>;
                            //video.srcObject = event.streams[0];
                            console.log("Streams:", this.streams);
                            this.setState({ streamElements: [...this.state.streamElements, <StreamingCard video={video} key={id} />] });
                        }
                    };
                    this.peerConnections[id].onicecandidate = event => {
                        if (event.candidate) {
                            this.socket.emit("candidate", id, event.candidate, this.roomId, false);
                        }
                    };
                });

                this.socket.on("connect", () => {
                    this.socket.emit("join", this.roomId);
                    this.socket.emit("watcher", this.roomId);
                });

                this.socket.on("broadcaster", () => {
                    this.socket.emit("watcher", this.roomId);
                });

                this.socket.on("disconnectPeer", (id) => {
                    console.log("remove stream: ",id);
                    for( let i = 0; i < this.streams.length; i++){

                        if ( this.streams[i]["id"] === id) {
                            console.log("stream removed with id: ",id);
                            this.streams.splice(i, 1);
                        }

                    }
                    console.log("streams", this.streams)
                })

                window.onunload = window.onbeforeunload = () => {
                    this.socket.close();
                    for (let pc in this.peerConnections) {
                        this.peerConnections[pc].close();
                    }
                };
            }
        });
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    render() {
        const { loading, streams } = this.state;

        return (
            <div className="page">
                <header>
                    <h3>Streams</h3>
                </header>
                <article>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        justifyItems: "center",
                        gap: "45px",
                    }}>
                        {this.state.streamElements}
                    </div>
                </article>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    token: state.token,
    refresh_token: state.refresh_token,
});
export default connect(mapStateToProps)(Streams);

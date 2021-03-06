import { VideoCard } from "./VideoCard";
import Icon from "@mdi/react";
import { Component } from "react";
import io from "socket.io-client";

export default class StreamingCard extends Component {
    video = <video playsInline autoPlay muted controls height="100%"></video>;
    
    constructor(props) {
        super(props);
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
import { VideoCard } from "./VideoCard";
import Icon from "@mdi/react";
import { Component } from "react";
import io from "socket.io-client";

export default class StreamingCard extends Component {
    
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <VideoCard VideoComponent={this.props.video}>
                <div className="streaming-card-content">
                    <p>{this.props.title}</p>
                </div>
            </VideoCard>
        );
    }
}
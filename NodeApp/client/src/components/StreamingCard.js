import { VideoCard } from "./VideoCard";
import Icon from "@mdi/react";

export const StreamingCard = props => {
    return (
        <VideoCard VideoComponent={props.children}>
            <div className="streaming-card-content">
                <p>{props.title}</p>
            </div>
        </VideoCard>
    );
}
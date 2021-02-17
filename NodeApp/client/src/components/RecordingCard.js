import { VideoCard } from "./VideoCard";
import Icon from "@mdi/react";
import {mdiDownload} from "@mdi/js";

export const RecordingCard = props => {
    return (
        <VideoCard VideoComponent={props.children}>
            <div className="recording-card-content">
                <p>{props.title}</p>
                <a href={props.download} download={props.save}><Icon className="nav-item-icon" path={mdiDownload} color="#5476FE"/></a>
            </div>
        </VideoCard>
    );
}
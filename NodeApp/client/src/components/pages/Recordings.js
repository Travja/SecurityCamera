import React, { Component } from "react";
import { RecordingCard } from "../RecordingCard";
import axios from "axios";

export default class Recordings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            recordings: this.getRecordings()
        };
    }

    componentDidMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    async getRecordings() {
        return await (await axios.get("/api/recordings")).data.map(recording => {
            return (
                <RecordingCard title={new Date().toString()} download={recording.url} save={recording.title}>
                    <img src={recording.thumbnail} width="100%" height="100%"/>
                </RecordingCard>
            );
        });
    }

    render() {
        return (
            <div className="page">
                <header>
                    <h3>Recordings</h3>
                </header>
                <article>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", justifyItems: "center", gap:"45px" }}>
                        {this.recordings}
                    </div>
                </article>
            </div>
        );
    }
}

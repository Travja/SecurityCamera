import React, { Component } from "react";
import { RecordingCard } from "../RecordingCard";
import { VideoCard } from "../VideoCard";

export default class Recordings extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    render() {
        const cards = [];
        for (let i = 0; i < 12; i++) {
            const imageUrl = "https://images.unsplash.com/photo-1505782215-3f12c6c3e45f?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&h=1080&q=80"
            cards.push(
                <RecordingCard title={new Date().toString()} download={imageUrl} save="street">
                    <img src={imageUrl} width="100%" height="100%"/>
                </RecordingCard>
            );
        }
        return (
            <div className="page">
                <header>
                    <h3>Recordings</h3>
                </header>
                <article>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", justifyItems: "center", gap:"45px" }}>
                        {cards}
                    </div>
                </article>
            </div>
        );
    }
}

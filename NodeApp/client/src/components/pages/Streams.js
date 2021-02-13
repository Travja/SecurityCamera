import React, { Component } from "react";
import { StreamingCard } from "../StreamingCard";

export default class Streams extends Component {
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
    for (let i = 0; i < 9; i++) {
        const imageUrl = "https://www.w3schools.com/html/mov_bbb.mp4"
        cards.push(
            <StreamingCard title={new Date().toString()} download={imageUrl} save="street">
                <video className="stream-video" src={imageUrl} width="100%" height="100%" controls muted/>
            </StreamingCard>
        );
    }
    return (
        <div className="page">
            <header>
                <h3>Streams</h3>
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

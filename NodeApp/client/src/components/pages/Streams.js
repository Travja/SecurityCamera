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
    for (let i = 0; i < 3*6; i++) {
        const imageUrl = "http://localhost:8080/";
        cards.push(
            <StreamingCard title={new Date().toString()} download={imageUrl} save="street" key={i}>
                <div style={{width: "100%", height: "100%", backgroundImage: `url(${imageUrl})`, backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center"}}></div>
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

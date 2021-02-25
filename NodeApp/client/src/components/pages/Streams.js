import React, { Component } from "react";
import { StreamingCard } from "../StreamingCard";
import axios from "axios";
import { connect } from "react-redux";

class Streams extends Component {
  constructor(props) {
    super(props);
    this.state = {
      streams: [],
    };

    this.getStreams = this.getStreams.bind(this);
  }

  async componentDidMount() {
    this.mounted = true;
    this.setState({ streams: await this.getStreams() });
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  async getStreams() {
    return await (await axios.get("/api/streams")).data.map((stream) => {
      return (
        <StreamingCard
          title={stream.title ? stream.title : new Date().toDateString()}
          key={stream.id}
        >
          <video src={stream.url} width="100%" height="100%"></video>
        </StreamingCard>
      );
    });
  }

  render() {
    return (
      <div className="page">
        <header>
          <h3>Streams</h3>
        </header>
        <article>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              justifyItems: "center",
              gap: "45px",
            }}
          >
            {this.state.streams}
          </div>
        </article>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  token: state.token,
});
export default connect(mapStateToProps)(Streams);

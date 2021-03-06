import React, { Component, Fragment } from "react";
import StreamingCard from "../StreamingCard";
import { connect } from "react-redux";
import StreamsAPI from "../../api/Streams";
import io from "socket.io-client";

/**
 * Streams page. This is a protected route.
 * To access the logged in user directly: `this.props.user`
 */
class Streams extends Component {
  constructor(props) {
    super(props);
    this.state = {
      streams: [],
      loading: true,
    };
  }

  async componentDidMount() {
    this.mounted = true;
    this.getStreams();
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

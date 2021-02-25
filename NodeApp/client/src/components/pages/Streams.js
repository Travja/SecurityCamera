import React, { Component, Fragment } from "react";
import { StreamingCard } from "../StreamingCard";
import { connect } from "react-redux";
import StreamsAPI from "../../api/Streams";

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

    this.getStreams = this.getStreams.bind(this);
  }

  async componentDidMount() {
    this.mounted = true;
    this.getStreams();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  async getStreams() {
    StreamsAPI.getStreams((err, streams) => {
      if (err)
        this.setState({ loading: false }, () =>
          console.log("Failed to get streams", err.error)
        );
      else
        this.setState({
          loading: false,
          streams: streams.map((stream) => {
            return (
              <StreamingCard
                title={stream.title ? stream.title : new Date().toDateString()}
                key={stream.id}
              >
                <video src={stream.url} width="100%" height="100%"></video>
              </StreamingCard>
            );
          }),
        });
    });
  }

  render() {
    const { loading, streams } = this.state;

    return (
      <div className="page">
        <header>
          <h3>Streams</h3>
        </header>
        <article>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <Fragment>
              {streams.length === 0 ? (
                <h4>No Streams</h4>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    justifyItems: "center",
                    gap: "45px",
                  }}
                >
                  {streams}
                </div>
              )}
            </Fragment>
          )}
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

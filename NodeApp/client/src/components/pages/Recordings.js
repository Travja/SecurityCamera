import React, { Component, Fragment } from "react";
import { RecordingCard } from "../RecordingCard";
import { connect } from "react-redux";
import RecordingAPI from "../../api/Recordings";

class Recordings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recordings: [],
      loading: true,
    };

    this.getRecordings = this.getRecordings.bind();
  }

  async componentDidMount() {
    this.mounted = true;
    this.setState({ recording: await this.getRecordings() });
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  async getRecordings() {
    RecordingAPI.getRecordings((err, recordings) => {
      if (err)
        this.setState({ loading: false }, () =>
          console.log("Failed to get recordings", err.error)
        );
      else
        this.setState({
          loading: false,
          recordings: recordings.map((recording) => {
            return (
              <RecordingCard
                title={new Date().toString()}
                download={recording.url}
                save={recording.title}
              >
                <img src={recording.thumbnail} width="100%" height="100%" />
              </RecordingCard>
            );
          }),
        });
    });
  }

  render() {
    const { loading, recordings } = this.state;

    return (
      <div className="page">
        <header>
          <h3>Recordings</h3>
        </header>
        <article>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <Fragment>
              {recordings.length === 0 ? (
                <h4>No Recordings</h4>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    justifyItems: "center",
                    gap: "45px",
                  }}
                >
                  {this.recordings}
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
export default connect(mapStateToProps)(Recordings);

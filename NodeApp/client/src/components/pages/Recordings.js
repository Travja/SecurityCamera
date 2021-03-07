import React, { Component, Fragment } from "react";
import { RecordingCard } from "../RecordingCard";
import { connect } from "react-redux";
import RecordingAPI from "../../api/Recordings";

/**
 * Recordings page. This is a protected route. 
 * To access the logged in user directly: `this.props.user`
 */
class Recordings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recordings: [],
      loading: true,
    };

    this.getRecordings = this.getRecordings.bind(this);
  }

  async componentDidMount() {
    this.mounted = true;
    this.getRecordings();
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
          recordings: (recordings ? recordings : []).map((recording) => {
              console.log(recording);
            return (
              <RecordingCard
                title={new Date(recording.RecordingDate).toString()}
                download={(process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL : "") + recording.BlobURL}
                save={recording.title}
                key={new Date(recording.RecordingDate).toString()}
              >
                <video src={(process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL : "") + recording.BlobURL} width="100%" height="100%" />
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
                  {recordings}
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

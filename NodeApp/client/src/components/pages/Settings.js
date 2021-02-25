import React, { Component } from "react";
import { connect } from "react-redux";

class Settings extends Component {
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
    return <div>its the settings page!</div>;
  }
}

const mapStateToProps = (state) => ({
  token: state.token,
  refresh_token: state.refresh_token,
});
export default connect(mapStateToProps)(Settings);

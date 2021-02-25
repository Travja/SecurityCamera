import React, { Component } from "react";
import { connect } from "react-redux";
import { Redux } from "../../redux/redux-types";

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
    const logout = () => {
      this.props.dispatch({ type: Redux.LOGOUT, action: null });
      window.location.href = "/";
    };
    return (
      <div>
        its the settings page!
        <button onClick={logout}>Logout</button>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  token: state.token,
  refresh_token: state.refresh_token,
});
export default connect(mapStateToProps)(Settings);

import React, { Component } from "react";
import { connect } from "react-redux";
import { NavLink } from "react-router-dom";

class Home extends Component {
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
        return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
            <p style={{ margin: "0", textAlign: "center" }}>
                Welcome to Securty Camera to start <NavLink exact to='/login'>Login or Register</NavLink>
            </p>
        </div>;
    }
}

const mapStateToProps = (state) => ({
    token: state.token,
    refresh_token: state.refresh_token,
});
export default connect(mapStateToProps)(Home);

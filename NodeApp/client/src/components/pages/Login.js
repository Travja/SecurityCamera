import { Component } from "react";
import { connect } from "react-redux";
import AccountAPI from "../../api/Account";

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
    };
  }

  render() {
    const { password, username } = this.state;
    const login = () => {
      console.log("called", this.state);
      AccountAPI.login({ password, password: username }, (err) => {
        if (err) {
          console.log("error", err.error);
        } else {
          window.location.href = "/recordings";
        }
      });
    };
    return (
      <form onSubmit={login}>
        <h3>Log in</h3>
        <input
          onChange={({ target: { value } }) => this.setState({ email: value })}
          type="email"
          className="form-control"
          placeholder="Email"
        />
        <input
          onChange={({ target: { value } }) =>
            this.setState({ password: value })
          }
          type="password"
          placeholder="Password"
        />
        <button type="submit">Login</button>
      </form>
    );
  }
}

const mapStateToProps = (state) => ({
  token: state.token,
  refresh_token: state.refresh_token,
});
export default connect(mapStateToProps)(Login);

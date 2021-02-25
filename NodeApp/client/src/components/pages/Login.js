import {Component} from "react";
import { connect } from 'react-redux';

export default class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: ''
        };
    }

    render() {
        return(
            <form>
                <h3>Log in</h3>
                <input type="email" className="form-control" placeholder="Email" />
                <input type="password" placeholder="Password" />
                <button type="submit">Login</button>
            </form>
        );
    }
}
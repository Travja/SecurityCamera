import React, { Component } from "react";
import { connect } from "react-redux";
import { Redux } from "../../redux/redux-types";
import { Button, Card, CardActions, CardContent, TextField, Typography } from "@material-ui/core";
import AccountAPI from "../../api/Account";
import { withStyles } from "@material-ui/core/styles";
import { T_VAR, ls } from "../../redux/redux-reducer";
import axios from "axios";

const styles = theme => ({
    root: {
        minWidth: 275,
        '& .MuiTextField-root': {
            margin: theme.spacing(1),
            marginLeft: theme.spacing(0),
            marginRight: theme.spacing(0),
            width: '100%',
        }
    },
    bullet: {
        display: 'inline-block',
        margin: '0 2px',
        transform: 'scale(0.8)',
    },
    title: {
        fontSize: 14,
    },
    pos: {
        marginBottom: 12,
    },
});

/**
 * Settings page. This is a protected route. 
 * To access the logged in user directly: `this.props.user`
 */
class Settings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            Name: this.props.user.Name,
            Password: this.props.user.Password
        };
        this.updateUser = this.updateUser.bind(this);
    }

    componentDidMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    async updateUser() {
        console.log(this.state);
        await axios.put("/api/account", { Name: this.state.Name, Password: this.state.Password }, { headers: { Authorization: `Bearer ${await ls.get(T_VAR)}` } });
        AccountAPI.login({ password: this.state.Password, email: this.props.user.Email }, (err) => {
            if (err) {
                console.log("error", err.error);
            } else {
                window.location.href = "/recordings";
            }
        });
    }

    render() {
        const { classes } = this.props;
        const logout = () => {
            this.props.dispatch({ type: Redux.LOGOUT, action: null });
            window.location.href = "/";
        };
        return (
            <div className="Auth">
                <Card className={classes.root}>
                    <form>
                        <CardContent>
                            <Typography variant="h5" component="h2">Edit Account</Typography>
                            <div><TextField onChange={({ target: { value } }) => this.setState({ Name: value })} type="text" label="Name" /></div>
                            <div><TextField onChange={({ target: { value } }) => this.setState({ Password: value })} type="password" label="Password" /></div>
                        </CardContent>
                        <CardActions>
                            <Button variant="contained" color="primary" onClick={this.updateUser}>Update</Button>
                            <Button onClick={logout}>Logout</Button>
                        </CardActions>
                    </form>
                </Card>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    token: state.token,
    refresh_token: state.refresh_token,
});
export default connect(mapStateToProps)(withStyles(styles, { withTheme: true })(Settings));

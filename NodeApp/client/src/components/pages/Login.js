import { Component } from "react";
import { connect } from "react-redux";
import AccountAPI from "../../api/Account";
import { withStyles } from "@material-ui/core/styles";
import { Button, Card, CardActions, CardContent, TextField, Typography } from "@material-ui/core"
import { NavLink } from "react-router-dom";

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

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: "",
            password: "",
        };
    }

    render() {
        const { classes } = this.props;
        const { password, email } = this.state;

        const login = (e) => {
            e.preventDefault();
            let emailL =  email.toLowerCase();
            AccountAPI.login({ password, email:emailL }, (err) => {
                if (err) {
                    console.log("error", err.error);
                } else {
                    window.location.href = "/recordings";
                }
            });
        };
        return (
            <div className="Auth">
                <Card className={classes.root}>
                    <form>
                        <CardContent>
                            <Typography variant="h5" component="h2">Log in</Typography>
                            <div><TextField onChange={({ target: { value } }) => this.setState({ email: value })} type="email" label="Email" /></div>
                            <div><TextField onChange={({ target: { value } }) => this.setState({ password: value })} type="password" label="Password" /></div>
                        </CardContent>
                        <CardActions>
                            <Button variant="contained" color="primary" onClick={login}>Login</Button>
                            <NavLink exact to="/register" style={{ textDecoration: "none" }}><Button>Register</Button></NavLink>
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
export default connect(mapStateToProps)(withStyles(styles, { withTheme: true })(Login));

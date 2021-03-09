import { Component, createRef } from "react";
import { connect } from "react-redux";
import AccountAPI from "../../api/Account";
import { withStyles } from "@material-ui/core/styles";
import { Button, Card, CardActions, CardContent, TextField, Typography } from "@material-ui/core"
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

class Register extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: "",
            password: "",
            name: ""
        };
        this.fileInput = createRef();
        this.register = this.register.bind(this);
    }

    async register(e) {
        AccountAPI.login({ password: this.state.password, email: this.state.email }, (err) => {
            if (err) {
                console.log("error", err.error);
            } else {
                window.location.href = "/streams";
            }
        });
    };

    render() {
        const { classes } = this.props;

        return (
            <div className="Auth">
                <Card className={classes.root}>
                    <form action="/api/account" enctype="multipart/form-data" method="post">
                        <CardContent>
                            <Typography variant="h5" component="h2">Register</Typography>
                            <div><TextField onChange={({ target: { value } }) => this.setState({ name: value })} type="text" name="name" label="Name" /></div>
                            <div><TextField onChange={({ target: { value } }) => this.setState({ email: value })} type="email" name="email" label="Email" required /></div>
                            <div><TextField onChange={({ target: { value } }) => this.setState({ password: value })} type="password" name="password" label="Password" required /></div>
                            <label>Profile Picture</label>
                            <div><input type="file" ref={this.fileInput} name="picture" /></div>
                        </CardContent>
                        <CardActions>
                            <Button variant="contained" color="primary" type="submit" value="Register">Register</Button>
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
export default connect(mapStateToProps)(withStyles(styles, { withTheme: true })(Register));

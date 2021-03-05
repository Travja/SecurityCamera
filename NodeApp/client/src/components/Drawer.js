import React from "react";
import { NavLink } from "react-router-dom";
import Icon from "@mdi/react";
import { mdiCog, mdiFilmstripBoxMultiple, mdiHome, mdiVideoWireless, mdiLogin, mdiLogout } from "@mdi/js";
import AccountAPI from "../api/Account";
import { Redux } from "../redux/redux-types";
import { connect } from "react-redux";

export const DrawerItem = props => {
    return (
        <NavLink exact to={props.path ? props.path : '/'} className="nav-item">
            <div className="nav-item-icon-wrapper">
                <Icon className="nav-item-icon" path={props.icon} />
            </div>
            <div className="nav-item-content"><p>{props.content}</p></div>
        </NavLink>
    );
}


class Drawer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: this.props.open ? this.props.open : false,
            isMousedOver: false
        };
        this.logout = this.logout.bind(this);
    }

    componentDidMount() {
        document.getElementById("drawer").addEventListener("mouseover", this.mousedOver.bind(this));
        document.getElementById("drawer").addEventListener("mouseout", this.mousedOut.bind(this));
        window.addEventListener("click", this.mouseClicked.bind(this))
        AccountAPI.getAccount((err, account) => {
            if (err) console.log("No account");
            console.log(account);
            if (account) {
                this.setState({ account: account });
            }
        });
    }

    mouseClicked(e) {
        if (e) {
            if (this.state.isMousedOver && !this.state.isOpen) {
                this.setState({ isOpen: true });
            }
            else if (!this.state.isMousedOver && this.state.isOpen) {
                this.setState({ isOpen: false });
            }
        }
    }

    //There's a better way to check for this condition, but this should work.
    mousedOver(e) {
        if (e) {
            if (!this.state.isMousedOver) {
                this.setState({ isMousedOver: true });
            }
        }
    }

    mousedOut(e) {
        if (e) {
            if (this.state.isMousedOver) {
                this.setState({ isMousedOver: false });
            }
        }
    }
    logout() {
        this.props.dispatch({ type: Redux.LOGOUT, action: null });
        window.location.href = "/";
    };

    render() {
        return (
            <aside className={this.state.isOpen ? "" : "collapsed"} id="drawer" onClick={this.props?.onClick}>
                <header>
                    <div>
                        {this.state.account?.picture ? <img className="profile-picture" src={this.state.account.picture} /> : null}
                    </div>
                    <section>
                        <div>
                            {
                                this.state.account ? (<>
                                    {this.state.account.Username ? <p className="username">{this.state.account.username}</p> : null}
                                    {this.state.account.Email ? <p className="email">{this.state.account.Email}</p> : null}
                                </>) : null
                            }
                        </div>
                    </section>
                </header>
                <section className="navigation">
                    {
                        this.state.account ? (<>
                            <DrawerItem icon={mdiHome} content="Home" />
                            <DrawerItem path="/recordings" icon={mdiFilmstripBoxMultiple} content="Recordings" />
                            <DrawerItem path="/streams" icon={mdiVideoWireless} content="Streams" />
                            <DrawerItem path="/settings" icon={mdiCog} content="Settings" />
                            <div className="nav-item" onClick={this.logout}>
                                <div className="nav-item-icon-wrapper">
                                    <Icon className="nav-item-icon" path={mdiLogout} />
                                </div>
                                <div className="nav-item-content"><p>Logout</p></div>
                            </div>
                        </>) : <DrawerItem path="/login" icon={mdiLogin} content="Login" />
                    }

                </section>
            </aside>
        );
    }
}

const mapStateToProps = (state) => ({
    token: state.token,
    refresh_token: state.refresh_token,
});
export default connect(mapStateToProps)(Drawer);
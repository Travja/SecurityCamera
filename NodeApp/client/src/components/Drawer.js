import React from "react";
import {NavLink} from "react-router-dom";
import Icon from "@mdi/react";
import {mdiCog, mdiFilmstripBoxMultiple, mdiHome, mdiVideoWireless} from "@mdi/js";

export const DrawerItem = props => {
    return (
        <NavLink exact to={props.path ? props.path : '/'} className="nav-item">
            <div className="nav-item-icon-wrapper">
                <Icon className="nav-item-icon" path={props.icon}/>
            </div>
            <div className="nav-item-content"><p>{props.content}</p></div>
        </NavLink>
    );
}


export default class Drawer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: this.props.open ? this.props.open : false,
            isMousedOver: false
        };
    }
    
    componentDidMount() {
        document.getElementById("drawer").addEventListener("mouseover", this.mousedOver.bind(this));
        document.getElementById("drawer").addEventListener("mouseout", this.mousedOut.bind(this));
        window.addEventListener("click", this.mouseClicked.bind(this))
    }

    mouseClicked(e) {
        if(e) {
            if(this.state.isMousedOver && !this.state.isOpen) {
                this.setState({isOpen: true});
            } 
            else if(!this.state.isMousedOver && this.state.isOpen) {
                this.setState({isOpen: false});
            }
        }
    }

    //There's a better way to check for this condition, but this should work.
    mousedOver(e) {
        if(e) {
            if(!this.state.isMousedOver) {
                this.setState({isMousedOver: true});
            }
        }
    }

    mousedOut(e) {
        if(e) {
            if(this.state.isMousedOver) {
                this.setState({isMousedOver: false});
            }
        }
    }

    render() {
        return (
            <aside className={this.state.isOpen ? "" : "collapsed"} id="drawer" onClick={this.props?.onClick}>
                <header>
                    <div>
                        <img className="profile-picture" src="/profile-test.png"/>
                    </div>
                    <section>
                        <div>
                            <p className="username">Carter Wilde</p>
                            <p className="email">carterjwilde@gmail.com</p>
                        </div>
                    </section>
                </header>
                <section className="navigation">
                    <DrawerItem icon={mdiHome} content="Home"/>
                    <DrawerItem path="/recordings" icon={mdiFilmstripBoxMultiple} content="Recordings"/>
                    <DrawerItem path="/feeds" icon={mdiVideoWireless} content="Streams"/>
                    <DrawerItem path="/settings" icon={mdiCog} content="Settings"/>
                </section>
            </aside>
        );
    }
}
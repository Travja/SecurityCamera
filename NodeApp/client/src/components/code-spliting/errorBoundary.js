import React, { Component } from "react";
import { Fragment } from "react";

/**
 * React Error Boundary to catch UI errors during runtime.
 */
export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    /**
     * Sets the state of the component to an error
     * @param {Object} error 
     */
    static getDerivedStateFromError(_error) {
        return { hasError: true };
    }

    /**
     * Gets detailed information on the error
     * @param {Object} error 
     * @param {Object} errorInfo 
     */
    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <Fragment>
                    <h1>Something went wrong. :(</h1>
                    <p>
                        The following error occured:
            <br />
                    </p>
                    <p>{this.state.errorInfo}</p>
                </Fragment>
            );
        }
        return this.props.children;
    }
}

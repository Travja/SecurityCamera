import React, { Component } from "react";

export default class Feeds extends Component {
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
    return <div>its the feeds page!</div>;
  }
}

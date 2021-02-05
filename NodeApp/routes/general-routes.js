import eRequestType from "../enums/eRequestType.js";

/**
 * general route objects as an array
 */
const general_routes = [
  /**
   * Does nothing but set
   * the route formatting example
   */
  {
    url: "/api",
    type: eRequestType.GET,
    handler: (req, res) => {},
    callback: (req, res) => {},
  },
];

export default general_routes;

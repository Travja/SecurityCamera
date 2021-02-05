import eRequestType from "../enums/eRequestType.js";
import notification from "./notification-controller";

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
  {
    url: "/notify",
    type: eRequestType.POST,
    handler: notification
  },
];

export default general_routes;

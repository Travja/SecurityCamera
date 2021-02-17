import eRequestType from "../enums/eRequestType.js";
import CameraRoutes from "../routes/camera-routes.js";

/**
 * general route objects as an array 
 * (Make ANY other routes their own files as this structure.)
 * e.g. account-routes.js <- only has routes for the account
 * This file is solely for `general` routes (login, logout...)
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
  ...CameraRoutes
];

export default general_routes;

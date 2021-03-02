import pkg from "dobject-routing";
import CameraRoutes from "../routes/camera-routes.js";
import AccountRoutes from "../routes/account-routes.js";
import NofificationRoutes from "../routes/notification-controller.js";

const { ERequestType } = pkg;

/**
 * general route objects as an array
 * (Make ANY other routes their own files as this structure.)
 * e.g. account-routes.js <- only has routes for the account
 * This file is solely for `general` routes (login, logout...)
 */
/**
 * @type {import("dobject-routing").IRouter}
 */
const general_routes = {
  /**
   * Does nothing but set
   * the route formatting example
   */
  routes: [
    {
      method: ERequestType.GET,
      handlers: [
        (_req, res) => {
          res.send("Hello");
        },
        (_req, res) => {
          res.send("Hello");
        },
      ],
      routes: [...CameraRoutes, ...AccountRoutes, ...NofificationRoutes],
    },
    {
      url: "/upload-recording",
      method: ERequestType.POST,
      handlers: [
        async (req, res) => {
          res.send(200);
        },
      ],
    },
  ],
  routers: [],
};

export default general_routes;

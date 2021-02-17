import general_routes from "../routes/general-routes.js";
import notification_routes from "../routes/notification-controller.js";
import camera_routes from "../routes/camera-routes.js";

/**
 * Configures the routes for the api and chains
 * them to the app instance.
 */
class ConfigRoutes {
  /**
   * build on construction
   * @param {Object} instance - the express app instance
   */
  constructor(instance) {
    this.app = instance;
    this.configureRoutes(
      general_routes.concat(notification_routes).concat(camera_routes)
    );
  }

  /**
   * Returns a bound method available on an object.
   *
   * @param {Object} obj object to bind method
   * @param {String} key name of object method
   *
   * @return {Function} funtion found from the object
   */
  prop(obj, key) {
    return obj[key].bind(obj);
  }

  /**
   * Takes an array of route objects and binds them to the instance of the app.
   *
   * @param {Array} routes
   */
  configureRoutes(routes) {
    routes.forEach((route) => {
      this.prop(this.app, route.type)(
        route.url,
        route.handler,
        route.callback
          ? route.callback
          : () => {
              /*no callback*/
            }
      );
    });
  }
}

export default { ConfigRoutes };

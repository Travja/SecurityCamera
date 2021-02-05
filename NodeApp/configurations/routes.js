import general_routes from "../routes/general-routes.js";

class ConfigRoutes {
  constructor(instance) {
    this.app = instance;
    this.configureRoutes(general_routes);
  }

  prop(obj, key) {
    return obj[key].bind(obj);
  }

  configureRoutes(routes) {
    routes.forEach((route) => {
      this.prop(this.app, route.type)(
        route.url,
        route.handler,
        route.callback
          ? route.callback
          : () => {
              /**/
            }
      );
    });
  }
}

export default { ConfigRoutes };

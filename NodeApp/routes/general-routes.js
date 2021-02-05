import eRequestType from "../emuns/eRequestType.js";

const general_routes = [
  {
    url: "/api",
    type: eRequestType.GET,
    handler: (req, res) => {},
    callback: (req, res) => {},
  },
];

export default general_routes;

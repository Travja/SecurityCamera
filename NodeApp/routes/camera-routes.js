import eRequestType from "../enums/eRequestType.js";

const camera_routes = [
  /**
   * Get a single stream
   */
  {
    url: "/api/stream",
    type: eRequestType.GET,
    handler: async (req, res) => {},
  },
  /**
   * Get all the streams
   */
  {
    url: "/api/streams",
    type: eRequestType.GET,
    handler: async (req, res) => {},
  },
];

export default camera_routes;

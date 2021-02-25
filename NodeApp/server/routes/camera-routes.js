//@ts-check
import recording_routes from "./recording-routes.js";
import stream_routes from "./stream-routes.js";
/**
 * @type {import("dobject-routing").IRoute[]}
 */
const camera_routes = [
    ...stream_routes,
    ...recording_routes,
];

export default camera_routes;

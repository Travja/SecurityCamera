//@ts-check
import eRequestType from "../enums/eRequestType.js";
import { authenticateUser } from "./authentication.js";
import stream_routes from "./stream-routes.js";
/**
 * @type {import("dobject-routing").IRoute[]}
 */
const camera_routes = [
    ...stream_routes
];

export default camera_routes;

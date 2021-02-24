import pkg from "dobject-routing";
import { useSql } from "../configurations/SQLConfig.js";
import { authenticateUser } from "./authentication.js";

const { ERequestType } = pkg;
// let request = await(await useSql()).request();
/**
 * @type {import("dobject-routing").IRoute[]}
 */
const stream_routes = [
    /**
    * Get a single stream
    */
    {
        url: "/stream",
        method: ERequestType.GET,
        handlers: [
            authenticateUser,
            async (req, res) => {
                try {
                    const { id } = req.headers;
                    if (!id) return res.status(400).json({ error: "No stream id" });
                    // TODO: search for a specific stream by its id and return it.
                    // lines 18-22 are static data and should be removed later
                    // const result = await request.query`select * from Camera where ${id};`
                    res.send(result.recordset);
                } catch (err) {
                    return res.status(500).json({ error: err });
                }
            }
        ]
    },
    /**
    * Get all the streams
    */
    {
        url: "/streams",
        method: ERequestType.GET,
        handlers: [
            authenticateUser,
            async (req, res) => {
                try {
                    // const result = await request.query`select * from Camera;`
                    res.send(result.recordset);
                } catch (err) {
                    return res.status(500).json({ error: err });
                }
            }
        ]
    }
]
export default stream_routes;
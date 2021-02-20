import { useSql } from "../configurations/SQLConfig.js";
import eRequestType from "../enums/eRequestType.js";
import { authenticateUser } from "./authentication.js";

let request = await(await useSql()).request();

const stream_routes = [
    /**
    * Get a single stream
    */
    {
        url: "/api/stream",
        type: eRequestType.GET,
        handler: authenticateUser,
        callback: async (req, res) => {
            try {
                const { id } = req.headers;
                if (!id) return res.status(400).json({ error: "No stream id" });
                // TODO: search for a specific stream by its id and return it.
                // lines 18-22 are static data and should be removed later
                const result = await request.query`select * from Camera where ${id};`
                res.send(result.recordset);
            } catch (err) {
                return res.status(500).json({ error: err });
            }
        },
    },
    /**
    * Get all the streams
    */
    { 
        url: "/api/streams",
        type: eRequestType.GET,
        handler: authenticateUser,
        callback: async (req, res) => {
            try {
                const result = await request.query`select * from Camera;`
                res.send(result.recordset);
            } catch (err) {
                return res.status(500).json({ error: err });
            }
        },
    }
]
export default stream_routes;
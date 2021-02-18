import mssql from "mssql";
import eRequestType from "../enums/eRequestType.js";
import { authenticateUser } from "./authentication.js";

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
                return res.status(200).json({
                    id: "1234",
                    stream_url: "https://google.com",
                    title: "Test",
                });
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
                // TODO: search for all streams in the database and return them.
                // lines 38-52 are static data and should be removed later
                return res.status(200).json([
                    {
                        id: "1234",
                        url: "https://www.w3schools.com/html/mov_bbb.mp4",
                        title: "Test",
                    },
                    {
                        id: "12345",
                        url: "https://www.w3schools.com/html/mov_bbb.mp4",
                        title: "Test 2",
                    },
                ]);
            } catch (err) {
                return res.status(500).json({ error: err });
            }
        },
    }
]
export default stream_routes;
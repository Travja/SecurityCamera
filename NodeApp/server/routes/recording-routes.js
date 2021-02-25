import pkg from "dobject-routing";
import { request } from "express";
import { useSql } from "../configurations/SQLConfig.js";
import { authenticateUser } from "./authentication.js";

const { ERequestType } = pkg;
// let request = await(await useSql()).request();
/**
 * @type {import("dobject-routing").IRoute[]}
 */
const recording_routes = [
    /**
    * Get a single stream
    */
    {
        url: "/recordings/:id",
        method: ERequestType.GET,
        handlers: [
            authenticateUser,
            async (req, res) => {
                try {
                    const id = Number.parseInt(req.params.id);
                    if (!id && id != NaN) return res.status(400).json({ error: "No stream id" });
                    const result = await request.query`select * from Recording where RecordingID = ${id};`
                    res.send(result.recordset);
                } catch (err) {
                    return res.status(500).json({ error: err });
                }
            }
        ]
    },
    /**
    * Get all the recordings
    */
    {
        url: "/recordings",
        method: ERequestType.GET,
        handlers: [
            authenticateUser,
            async (req, res) => {
                try {
                    const result = await request.query`select * from Recording;`
                    res.send(result.recordset);
                } catch (err) {
                    return res.status(500).json({ error: err });
                }
            }
        ]
    },
    /**
     * Create a new stream.
     * @type {import("dobject-routing").IRoute}
     */
    {
        url: "/recordings",
        method: ERequestType.POST,
        handlers: [
            authenticateUser,
            async (req , res) => {
                await request.query`insert into Recording (RecordingDate, Camera, BlobURL) values (${req.body.RecordingDate}, ${req.body.Camera}, ${req.user.BlobURL})`;
                res.sendStatus(201);
            }
        ]
    },
    /**
     * Update a stream
     * @type {import("dobject-routing").IRoute}
     */
    {
        url: "/recordings/:id",
        method: ERequestType.PUT,
        handlers: [
            authenticateUser,
            async (req, res) => {
                await request.query`UPDATE Camera SET StreamURL = ${req.body.StreamURL}, Name=${req.body.Name} WHERE CameraID = ${req.params.id}`;
                res.sendStatus(200);
            }
        ]
    },
    /**
     * Remove a stream
     * @type {import("dobject-routing").IRoute}
     */
    {
        url: "/recordings/:id",
        method: ERequestType.DELETE,
        handlers: [
            authenticateUser,
            async (req, res) => {
                let result = await request.query`select * from Camera where CameraID = ${req.params.id};`;
                if(req.user.UserID == result.recordset[0].UserID) {
                    await request.query`DELETE FROM Camera WHERE CameraID = ${req.params.id}`;
                    res.sendStatus(200);
                }
            }
        ]
    }
]
export default recording_routes;
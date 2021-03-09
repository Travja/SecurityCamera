import pkg from "dobject-routing";
import { useSql } from "../configurations/SQLConfig.js";
import { authenticateUser } from "./authentication.js";

const { ERequestType } = pkg;
/**
 * @type {import("dobject-routing").IRoute[]}
 */
const recording_routes = [
    /**
     * Get a single recording
     * @type {import("dobject-routing").IRoute}
     */
    {
        url: "/recordings/:id",
        method: ERequestType.GET,
        handlers: [
            authenticateUser,
            async (req, res) => {
                try {
                    const id = Number.parseInt(req.params.id);
                    if (!id && id != NaN)
                        return res.status(400).json({ error: "No stream id" });
                    let request = await (await useSql()).request();
                    const result = await request.query`select * from Recording where RecordingID = ${id};`;
                    res.send(result.recordset);
                } catch (err) {
                    return res.status(500).json({ error: err });
                }
            },
        ],
    },
    /**
     * Get all the recordings
     * @type {import("dobject-routing").IRoute}
     */
    {
        url: "/recordings",
        method: ERequestType.GET,
        handlers: [
            authenticateUser,
            async (req, res) => {
                try {
                    let request = await (await useSql()).request();
                    const result = await request.query`select * from Recording where UserID=${req.user.UserID} order by [RecordingDate] desc;`;
                    res.send(result.recordset);
                } catch (err) {
                    return res.status(500).json({ error: err });
                }
            },
        ],
    },
    /**
     * Create a new recording.
     * @type {import("dobject-routing").IRoute}
     */
    {
        url: "/recordings",
        method: ERequestType.POST,
        handlers: [
            authenticateUser,
            async (req, res) => {
                let request = await (await useSql()).request();
                await request.query`insert into Recording (RecordingDate, Camera, BlobURL) values (${req.body.RecordingDate}, ${req.body.Camera}, ${req.user.BlobURL})`;
                res.sendStatus(201);
            },
        ],
    },
    /**
     * Update a recording
     * @type {import("dobject-routing").IRoute}
     */
    {
        url: "/recordings/:id",
        method: ERequestType.PUT,
        handlers: [
            authenticateUser,
            async (req, res) => {
                let request = await (await useSql()).request();
                await request.query`UPDATE Camera SET StreamURL = ${req.body.StreamURL}, Name=${req.body.Name} WHERE CameraID = ${req.params.id}`;
                res.sendStatus(200);
            },
        ],
    },
    /**
     * Remove a recording
     * @type {import("dobject-routing").IRoute}
     */
    {
        url: "/recordings/:id",
        method: ERequestType.DELETE,
        handlers: [
            authenticateUser,
            async (req, res) => {
                let request = await (await useSql()).request();
                let result = await request.query`select * from Camera where CameraID = ${req.params.id};`;
                if (req.user.UserID == result.recordset[0].UserID) {
                    let request2 = await (await useSql()).request();
                    await request2.query`DELETE FROM Camera WHERE CameraID = ${req.params.id}`;
                    res.sendStatus(200);
                }
            },
        ],
    },
];
export default recording_routes;

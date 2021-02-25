import pkg from "dobject-routing";
import { useSql } from "../configurations/SQLConfig.js";
import { authenticateUser } from "./authentication.js";

const { ERequestType } = pkg;
/**
 * @type {import("dobject-routing").IRoute[]}
 */
const stream_routes = [
  /**
   * Get a single stream
   * @type {import("dobject-routing").IRoute}
   */
  {
    url: "/streams/:id",
    method: ERequestType.GET,
    handlers: [
      authenticateUser,
      async (req, res) => {
        try {
          const id = Number.parseInt(req.params.id);
          if (!id && id != NaN)
            return res.status(400).json({ error: "No stream id" });
          let request = await (await useSql()).request();
          const result = await request.query`select * from Camera where CameraID = ${id} and Owner = ${req.user.UserID};`;
          res.send(result.recordset);
        } catch (err) {
          return res.status(500).json({ error: err });
        }
      },
    ],
  },
  /**
   * Get all the streams
   * @type {import("dobject-routing").IRoute}
   */
  {
    url: "/streams",
    method: ERequestType.GET,
    handlers: [
      authenticateUser,
      async (req, res) => {
        try {
          let request = await (await useSql()).request();
          const result = await request.query`select * from Camera where Owner = ${req.user.UserID};`;
          return res.send(result.recordset);
        } catch (err) {
          return res.status(500).json({ error: err.message });
        }
      },
    ],
  },
  /**
   * Create a new stream.
   * @type {import("dobject-routing").IRoute}
   */
  {
    url: "/streams",
    method: ERequestType.POST,
    handlers: [
      authenticateUser,
      async (req, res) => {
        let request = await (await useSql()).request();
        await request.query`insert into Camera (StreamURL, Name, Owner) values (${req.body.StreamURL}, ${req.body.Name}, ${req.user.UserID})`;
        return res.sendStatus(201);
      },
    ],
  },
  /**
   * Update a stream
   * @type {import("dobject-routing").IRoute}
   */
  {
    url: "/streams/:id",
    method: ERequestType.PUT,
    handlers: [
      authenticateUser,
      async (req, res) => {
        let request = await (await useSql()).request();
        await request.query`UPDATE Camera SET StreamURL = ${req.body.StreamURL}, Name=${req.body.Name} WHERE CameraID = ${req.params.id}`;
        return res.sendStatus(200);
      },
    ],
  },
  /**
   * Remove a stream
   * @type {import("dobject-routing").IRoute}
   */
  {
    url: "/streams/:id",
    method: ERequestType.DELETE,
    handlers: [
      authenticateUser,
      async (req, res) => {
        let request = await (await useSql()).request();
        let result = await request.query`select * from Camera where CameraID = ${req.params.id};`;
        if (req.user.UserID == result.recordset[0].UserID) {
          let request2 = await (await useSql()).request();
          await request2.query`DELETE FROM Camera WHERE CameraID = ${req.params.id}`;
          return res.sendStatus(200);
        }
      },
    ],
  },
];
export default stream_routes;

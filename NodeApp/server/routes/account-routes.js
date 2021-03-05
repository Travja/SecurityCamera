import pkg from "dobject-routing";
import {
  authenticateUser,
  generateAccessToken,
  generateRefreshToken,
} from "./authentication.js";
import jws from "jsonwebtoken";
import { REFRESH_TOKEN_SECRET } from "../keys.js";
import { useSql } from "../configurations/SQLConfig.js";
const { verify } = jws;
const { ERequestType } = pkg;
import bcrypt from "bcryptjs";

/**
 * @type {import("dobject-routing").IRoute[]}
 */
const account_routes = [
  /**
   * Gets a new set of tokens used for authentication client side.
   * @type {import("dobject-routing").IRoute}
   */
  {
    url: "/tokens",
    method: ERequestType.POST,
    handlers: [
      async (req, res) => {
        try {
          const { refreshToken } = req.body;
          if (!refreshToken)
            return res.status(403).json({ error: "No refresh token" });
          verify(refreshToken, REFRESH_TOKEN_SECRET, async (err, data) => {
            if (err) return res.status(403).json({ error: "Invalid token" });
            let request = await (await useSql()).request();
            const result = await request.query`select * from [User] where UserID = ${data.id}`;
            if (result.recordset[0]) {
              const access_token = generateAccessToken({
                id: result.recordset[0].UserID,
              });
              const refresh_token = generateRefreshToken({
                id: result.recordset[0].UserID,
              });
              return res.status(200).json({
                token: access_token,
                refreshToken: refresh_token,
              });
            }
            return res.status(422).json({ error: "null user" });
          });
        } catch (err) {
          return res.status(500).json({ error: `error: ${err}` });
        }
      },
    ],
  },
  /**
   * Logs a user into the system and retuns the JWT tokens.
   * @type {import("dobject-routing").IRoute}
   */
  {
    url: "/login",
    method: ERequestType.POST,
    handlers: [
      async (req, res) => {
        try {
          const { email, password } = req.body;
          let request = await (await useSql()).request();
          const result = await request.query`select * from [User] where Email = ${email}`;
          if (!result.recordset[0])
            return res.status(404).json({ error: "No user found" });
          if (!bcrypt.compareSync(password, result.recordset[0].Hash))
            return res.status(403).json({ error: "Failed to login" });
          const access_token = generateAccessToken({
            id: result.recordset[0].UserID,
          });
          const refresh_token = generateRefreshToken({
            id: result.recordset[0].UserID,
          });
          return res.status(200).json({
            token: access_token,
            refreshToken: refresh_token,
          });
        } catch (err) {
          return res.status(500).json({ error: `error: ${err}` });
        }
      },
    ],
  },
  /**
   * Gets thecurrently logged in user.
   * @type {import("dobject-routing").IRoute}
   */
  {
    url: "/account",
    method: ERequestType.GET,
    handlers: [
      authenticateUser,
      (req, res) => {
        return res.status(200).json({ user: req.user });
      },
    ],
  },
  /**
   * Updates all or part of a user
   * @type {import("dobject-routing").IRoute}
   */
  {
    url: "/account",
    method: ERequestType.PUT,
    handlers: [
      authenticateUser,
      async (req, res) => {
        //TODO: Implement
        // `req.user` stores the authenticated user. No need to retrieve from the database.
      },
    ],
  },
  /**
   * Terminate a user account
   * @type {import("dobject-routing").IRoute}
   */
  {
    url: "/account",
    method: ERequestType.DELETE,
    handlers: [
      authenticateUser,
      async (req, res) => {
        const user = req.user;
        //TODO: Implement
        //delete a user account
      },
    ],
  },
];

export default account_routes;

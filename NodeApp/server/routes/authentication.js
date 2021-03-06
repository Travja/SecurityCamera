import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from "../keys.js";
const { verify, sign } = jwt;
import { useSql } from "../configurations/SQLConfig.js";

/**
 * Authenticates a USer user with authorization headers.
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 */
export const authenticateUser = (req, res, next) => {
  try {
    const { authorization } = req.headers;
    const token = authorization && authorization.split(" ")[1];
    if (!token)
      return res
        .status(403)
        .json({ error: "Not Authorized to access this route." });
    verify(token, ACCESS_TOKEN_SECRET, async (err, data) => {
      if (err) return res.status(403).json({ error: "Invalid token" });
      let request = await (await useSql()).request();
      const result = await request.query`select * from [User] where UserID = ${data.id}`;
      if (result.recordset[0]) {
        req.user = result.recordset[0];
        return next();
      }
      return res.status(422).json({ error: "null user" });
    });
  } catch (err) {
    return res.status(500).json({ error: err });
  }
};

/**
 * Generates the JWT token
 * @param {Object} user user object
 */
export const generateAccessToken = (user) => {
  return sign(user, ACCESS_TOKEN_SECRET, { expiresIn: "120s" });
};

/**
 * Generates the refresh JWT token
 * @param {Object} user user object
 */
export const generateRefreshToken = (user) => {
  return sign(user, REFRESH_TOKEN_SECRET, { expiresIn: "1h" });
};

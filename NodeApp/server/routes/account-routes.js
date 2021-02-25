import eRequestType from "../enums/eRequestType.js";
import { authenticateUser } from "./authentication.js";

const account_routes = [
  {
    url: "/api/account",
    type: eRequestType.POST,
    handler: async (req, res) => {
      const user = req.body;
      // add 'user' to the database.
    },
  },
  {
    url: "/api/account",
    type: eRequestType.GET,
    handler: authenticateUser,
    callback: (req, res) => {
      return res.status(200).json({ user: req.user });
    },
  },
  {
    url: "/api/account",
    type: eRequestType.PUT,
    handler: authenticateUser,
    callback: async (req, res) => {
      // `req.user` stores the authenticated user. No need to retrieve from the database.
    },
  },
  {
    url: "/api/account",
    type: eRequestType.DELETE,
    handler: authenticateUser,
    callback: async (req, res) => {
      const user = req.user;
      //delete a user account
    },
  },
];

export default account_routes;

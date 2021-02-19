// import and confugure dotenv
import dotenv from "dotenv";
const { config } = dotenv;
config();

// environment variables
export const PORT = process.env.SERVER_PORT;
export const NODE_ENV = process.env.NODE_ENV;
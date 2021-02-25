// import and confugure dotenv
import dotenv from "dotenv";
const { config } = dotenv;
config();
// environment variables
export const PORT = process.env.SERVER_PORT;
export const DB_USER = process.env.DB_USER;
export const DB_PASS = process.env.DB_PASS;
export const DB_URL = process.env.DB_URL ? process.env.DB_URL : 'localhost';
export const DB_DATASOURCE = process.env.DB_DATASOURCE;
export const DB_PORT = process.env.DB_PORT ? Number.parseInt(process.env.DB_PORT) : 1433;
export const NODE_ENV = process.env.NODE_ENV;

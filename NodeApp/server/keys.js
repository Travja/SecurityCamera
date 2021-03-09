// import and confugure dotenv
import dotenv from "dotenv";
const { config } = dotenv;
config();
/**
 * Environment Variables
 * PORT: Port of the Web Server
 * DB_USER: Username of the MSSQL User
 * DB_PASS: Password of the MSSQL User
 * DB_URL: The URL of the MSSQL Server
 * DB_DATASOURCE: The name of the database that is being used default is localhost
 * DB_PORT: The port the database is running off default is 1433
 * NODE_ENV: The current node enviroment
 * ACCESS_TOKEN_SECRET: The token secret
 * REFESH_TOKEN_SECRET: The secret for the refesh token
 */
export const PORT = process.env.SERVER_PORT;
export const DB_USER = process.env.DB_USER;
export const DB_PASS = process.env.DB_PASS;
export const DB_URL = process.env.DB_URL ? process.env.DB_URL : 'localhost';
export const DB_DATASOURCE = process.env.DB_DATASOURCE;
export const DB_PORT = process.env.DB_PORT ? Number.parseInt(process.env.DB_PORT) : 1433;
export const NODE_ENV = process.env.NODE_ENV;
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
import sql from "mssql";
import {DB_DATASOURCE, DB_PASS, DB_PORT, DB_URL, DB_USER} from "../keys.js";

const {ConnectionPool} = sql;

let pool;

/**
 * @returns {ConnectionPool}
 */
export const useSql = async () => {
    if (!pool) {
        pool = new sql.ConnectionPool({
            user: DB_USER,
            password: DB_PASS,
            server: DB_URL,
            database: DB_DATASOURCE,
            port: DB_PORT
        });
        console.log("Attempting to connect to MSSQL with user " + DB_USER + ":" + DB_PASS);
        await pool.connect().catch(err => {
            console.error("Could not connect to MSSQL! Attempting again.");
        });
    }
    if (!pool._connected) {
        await pool.connect().catch(err => {
            console.error("Could not connect to MSSQL!");
            console.error(err);
        });
    }
    return pool;
}

export default class SQLConfig {
    constructor() {
        this.InitDb();
    }

    async InitDb() {
        const request = await (await useSql()).request();
        if (pool && pool._connected && request) {
            await request.query`IF  NOT EXISTS (SELECT * FROM sys.objects 
            WHERE object_id = OBJECT_ID(N'[dbo].[User]') AND type in (N'U')) BEGIN
                CREATE TABLE [User] (
                    UserID INT PRIMARY KEY IDENTITY(1,1),
                    Email VARCHAR(2048),
                    [Hash] VARCHAR(2048) 
                );
            END;`;
            await request.query`IF  NOT EXISTS (SELECT * FROM sys.objects 
            WHERE object_id = OBJECT_ID(N'[dbo].[Camera]') AND type in (N'U')) BEGIN
                CREATE TABLE Camera (
                    CameraID INT PRIMARY KEY IDENTITY(1,1),
                    StreamURL VARCHAR(2048),
                    [Name] VARCHAR(500),
                    [Owner] INT FOREIGN KEY REFERENCES [User](UserID)
                );
            END;`;
            await request.query`IF  NOT EXISTS (SELECT * FROM sys.objects 
            WHERE object_id = OBJECT_ID(N'[dbo].[Recording]') AND type in (N'U')) BEGIN
                CREATE TABLE Recording (
                    RecordingID INT PRIMARY KEY IDENTITY(1,1),
                    RecordingDate DATETIME,
                    Camera INT FOREIGN KEY REFERENCES Camera(CameraID),
                    RecordingLength INT,
                    BlobURL VARCHAR(2048)
                );
            END;`;
        } else {
            console.error("MSSQL Not connected. Could not create tables!");
        }
    }
}
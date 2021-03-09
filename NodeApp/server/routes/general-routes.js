import pkg from "dobject-routing";
import CameraRoutes from "../routes/camera-routes.js";
import AccountRoutes from "../routes/account-routes.js";
import NotificationRoutes from "../routes/notification-controller.js";
import multer from "multer";
import { useSql } from "../configurations/SQLConfig.js";
import fs from "fs";


const { ERequestType } = pkg;
let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        fs.mkdirSync("./uploads/recordings/", { recursive: true });
        cb(null, './uploads/recordings/')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
let upload = multer({ storage: storage });
/**
 * general route objects as an array
 * (Make ANY other routes their own files as this structure.)
 * e.g. account-routes.js <- only has routes for the account
 * This file is solely for `general` routes (login, logout...)
 */
/**
 * @type {import("dobject-routing").IRouter}
 */
const general_routes = {
    /**
     * Does nothing but set
     * the route formatting example
     */
    routes: [
        {
            method: ERequestType.GET,
            handlers: [
                (_req, res) => {
                    res.send("Hello");
                }
            ],
            routes: [...CameraRoutes, ...AccountRoutes, ...NotificationRoutes],
        },
        /**
         * Place for uploading video
         */
        {
            url: "/upload-recording",
            method: ERequestType.POST,
            handlers: [
                upload.single('recording'),
                async (req, res) => {
                    if (req.file) {
                        let request = await (await useSql()).request();
                        let millis = Number(req.body.Date);
                        let date = new Date(millis);
                        await request.query`insert into Recording (RecordingDate, UserID, BlobURL) values (${date}, ${req.body.UserID}, ${'/uploads/recordings/' + req.file.filename});`;
                        res.sendStatus(200);
                    }
                },
            ],
        },
    ],
    routers: [],
};

export default general_routes;

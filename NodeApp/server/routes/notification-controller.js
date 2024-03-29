import nodemailer from "nodemailer";
import Mailgen from "mailgen";
import { PORT } from "../keys.js";
import pkg from "dobject-routing";
import multer from "multer";

const { ERequestType } = pkg;

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
    },
});

let MailGenerator = new Mailgen({
    theme: "default",
    product: {
        name: "The Camera Guys",
        link: `localhost:${PORT}/`,
    },
});

/**
 * @type {import("dobject-routing").IRoute[]}
 */
const notification_routes = [
    /**
     * Sends an email notification.
     */
    {
        url: "/notify",
        method: ERequestType.POST,
        handlers: [
            multer().any(),
            async (req, res) => {
                try {
                    const { name, userEmail } = req.body;
                    const file = req.files[0]; //Can be uploaded under whatever key value.
                    console.log(file.buffer);
                    let response = {
                        body: {
                            name,
                            intro: "Motion has been detected!",
                            action: {
                                instructions: "To view the captured clip, please click here:",
                                button: {
                                    color: "#22BC66",
                                    text: "View",
                                    link: "https://www.neumont.edu",
                                },
                            },
                            outro:
                                "Need help, or have questions? Just reply to this email, we'd love to help.",
                        },
                    };
                    let message = {
                        from: "help@cameraguys.com",
                        to: userEmail,
                        subject: "Motion detected",
                        html: await MailGenerator.generate(response),
                        attachments: [
                            {
                                filename: file.originalname,
                                content: file.buffer,
                                contentType: file.mimetype,
                            },
                        ],
                    };
                    await transporter
                        .sendMail(message)
                        .then(() => {
                            return res
                                .status(200)
                                .json({ msg: "notification sent successfully" });
                        })
                        .catch((error) => {
                            return res.status(500).json({ error });
                        });
                } catch (err) {
                    return res.status(500).json({ error: err.message });
                }
            },
        ],
    },
];

export default notification_routes;

import nodemailer from "nodemailer";
import Mailgen from "mailgen";
import fs from "fs";
import { PORT } from "../keys.js";
import eRquestType from "../enums/eRequestType.js";

var transporter = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "6d388ff2a69cef",
    pass: "a0bc4d3f470f55",
  },
});

let MailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "The Camera Guys",
    link: `localhost:${PORT}/`,
  },
});

const notification_routes = [
  {
    url: "/api/notify",
    type: eRquestType.POST,
    handler: async (req, res) => {
      try {
        const { name, userEmail, filename, path } = req.body;
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
              filename: filename,
              path: path,
              contentType: "image/jpg",
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
            return res.status(500).json({ error: error.message });
          });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    },
  },
];

export default notification_routes;

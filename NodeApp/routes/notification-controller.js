const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");
const fs = require("fs");

var transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "6d388ff2a69cef",
        pass: "a0bc4d3f470f55"
    }
});

let MailGenerator = new Mailgen({
    theme:"default",
    product:{
        name:"The Camera Guys",
        link:"localhost:3000/"
    }
})

const notification = (req,res) => {
    const {name, userEmail, filename, path} = req.body;

    let response = {
        body:{
            name,
            intro: "Motion has been detected!",
            action: {
                instructions: 'To view the captured clip, please click here:',
                button: {
                    color: '#22BC66',
                    text: 'View',
                    link: 'https://www.neumont.edu'
                }
            },
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        },
    };

    let mail = MailGenerator.generate(response);

    let message = {
        from: "help@cameraguys.com",
        to: userEmail,
        subject: "Motion detected",
        html: mail,
        attachments: [{
            filename: filename,
            path: path,
            contentType: 'image/jpg'
        }]
    };

    transporter.sendMail(message).then(() => {
        return res
            .status(200)
            .json({msg: "notification sent successfully"});
    }).catch((error) => console.log(error));
}

module.exports = {notification};
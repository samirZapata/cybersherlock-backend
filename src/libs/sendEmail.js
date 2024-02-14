import { createTransport } from "nodemailer";
import { compile } from "handlebars";
import { readFileSync } from "fs";
import { join } from "path";
import users from "../models/users";
import app from "../app";

const sendEmail = async (email, subject, payload, template) => {
    const port = app.get('port');
  try {
    // create reusable transporter object using the default SMTP transport
    const transporter = createTransport({
      host: process.env.EMAIL_HOST,
      port: port,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD, 
      },
    });

    const source = readFileSync(join(__dirname, template), "utf8");
    const compiledTemplate = compile(source);
    const options = () => {
      return {
        from: process.env.FROM_EMAIL,
        to: email,
        subject: subject,
        html: compiledTemplate(payload),
      };
    };

    // Send email
    transporter.sendMail(options(), (error, info) => {
      if (error) {
        return error;
      } else {
        return res.status(200).json({
          success: true,
        });
      }
    });
  } catch (error) {
    return error;
  }
};

/*
Example:
sendEmail(
  "youremail@gmail.com,
  "Email subject",
  { name: "Eze" },
  "./templates/layouts/main.handlebars"
);
*/

export default sendEmail;
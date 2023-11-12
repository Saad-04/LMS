import nodemailer, { Transporter } from 'nodemailer';
import path from 'path';
import ejs from 'ejs';
import { trusted } from 'mongoose';
require('dotenv').config();
interface MailOptions {
  email: string;
  subject: string;
  template: string;
  data: { [key: string]: any };
  // avatar:
}
const sendEmail = async (options: MailOptions): Promise<void> => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMPT_HOST, //"",
    service: process.env.SMPT_SERVICE, //"gmail",
    port: parseInt(process.env.SMPT_PORT || '587'), //465,
    auth: {
      user: process.env.SMPT_USER, //"",//this is website owner email
      pass: process.env.SMPT_PASS, //"hkxykdsmbvtqvhnr",
    },
    // secure: trusted,
  });
  const { email, template, data, subject } = options;
  const templatePath = path.join(__dirname, '../mails', template);
  const html: string = await ejs.renderFile(templatePath, data); //templatePth is file name and data is (otpcode and user name)
  const option = {
    from: process.env.SMPT_USER, //this is website owner email
    to: email,
    subject,
    html,
  };
  await transporter.sendMail(option);
};

export default sendEmail;

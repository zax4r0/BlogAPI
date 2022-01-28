
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';
import ejs from 'ejs';
import { htmlToText } from 'html-to-text';
import juice from 'juice';

export interface MailInfo {
  from: string;
  to: string; // list of receivers
  subject: string; // Subject line
  text: string; // plain text body
  html: string;
  messageId: string;
}

export const sendMail = async ({ template: templateName, templateVars, ...restOfOptions }): Promise<void> => {
    let transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: 'gerda.sipes36@ethereal.email', // generated ethereal user
        pass: 'swSETypxpMVqPbrq5v', // generated ethereal password
      },
    });

    const templatePath = path.join(__dirname, `../templates/${templateName}.html`);
    const options = {
      ...restOfOptions,
    };

    if (templateName && fs.existsSync(templatePath)) {
      const template = fs.readFileSync(templatePath, 'utf-8');
      const html = ejs.render(template, templateVars);
      const text = htmlToText(html);
      const htmlWithStylesInlined = juice(html);

      options.html = htmlWithStylesInlined;
      options.text = text;
    }

    // send mail with defined transport object
    let info = await transporter.sendMail(options);

    console.log('Message sent: %s', info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    const url = nodemailer.getTestMessageUrl(info);
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    return url;
  }

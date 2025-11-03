const nodemailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require("html-to-text");

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstname = user.username.split(" ")[0];
    this.from = `Series Locker Team <${process.env.From_Email}>`;
    this.url = url;
  }

  newTransporter() {
    if (process.env.NODE_ENV === "production") {
      // SendGrid
      return nodemailer.createTransport({
        service: "SendGrid",
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      // service: 'Gmail',
      host: process.env.EMAIL_TEST_HOST,
      port: process.env.EMAIL_TEST_PORT,
      auth: {
        user: process.env.EMAIL_TEST_USER,
        pass: process.env.EMAIL_TEST_PASSWORD,
      },
      // Activate in gmail "less secure app" option - you can send up to 500 emails a day.
    });
  }

  async send(template, subject) {
    // 1) Render html based on a pug template.
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstname,
      url: this.url,
      subject,
      fromEmail: process.env.From_Email,
    });

    // 2) Define the email options

    const emailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html),
    };

    // 3) Create transporter and send email.

    await this.newTransporter().sendMail(emailOptions);
  }

  async sendWelcome() {
    await this.send("welcome", "Welcome to the Series Locker App");
  }

  async sendPasswordReset() {
    await this.send("passwordReset", "Reset Your Password");
  }
};

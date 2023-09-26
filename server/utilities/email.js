const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: "gmail", // e.g., Gmail
  host: 'smtp.gmail.com',
  auth: {
    user: "ameerhamzabutt555@gmail.com",
    pass: "lkuu zqrf yxvv vcui",
  },
});

// EJS template path
const templatePath = path.join(__dirname, "email-templates");

const sendEmail = async (data) => {
  try {

    const { to, subject, templateName, templateData } = data;

    // Render the EJS template
    const emailContent = await ejs.renderFile(
        path.join(templatePath, `${templateName}.ejs`),
        templateData?templateData:""
      );
      console.log("eeeeeeee",emailContent)

    // Email options
    const mailOptions = {
      from: "ameerhamzabutt555@gmail.com",
      to,
      subject,
      html: emailContent,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    console.log(`Email sent to ${to} with subject: ${subject}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = { sendEmail };

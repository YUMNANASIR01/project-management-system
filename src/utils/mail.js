import Mailgen from "mailgen";
import nodemailer from "nodemailer";

// --------------- send email function ----------------
const sendEmail = async (options) => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      // Appears in header & footer of e-mails
      name: "Project Manager",
      link: "https://taskmanagelink.com/",
      // Optional product logo
      // logo: 'https://mailgen.js/img/logo.png'
    },
  });
  //  email in text format
  const emailText = mailGenerator.generatePlaintext(options.MailgenContent);

  // email in html format
  const emailHtml = mailGenerator.generate(options.MailgenContent);

  //  creating transport for sending email
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_TRAP_SMPT_HOST,
    port: process.env.MAIL_TRAP_SMPT_PORT ,
    auth: {
      user: process.env.MAIL_TRAP_SMPT_USER,
      pass: process.env.MAIL_TRAP_SMPT_PASS,
    },
  });

    // defining email options
    const mail = {
        from : "mail.taskmanager@example.com",
        to : options.email ,
        subject : options.subject,
        text : emailText ,
        html : emailHtml,
    }

    // sending email https://nodemailer.com/
    try {
        await transporter.sendMail(mail)
    } catch(error){
        console.error("❌ Error sending email :" , error);
    }

};

// ----------------- email verification Mailgen Content----------------
const emailVerificationMailgenContent = (username, verificationURL) => {
  return {
    body: {
      name: username,
      intro: "Welcome to Our App! We are Excited to have you on Board. ",
      action: {
        instructions:
          "Please click the following Button to verify your Account:",
        button: {
          color: "#22BC66", // Optional action button color
          text: "Confirm your account",
          link: verificationURL,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};

// -------------------------------- forget password---------------------------------
const ForgetPasswordMailgenContent = (username, passwordResetURL) => {
  return {
    body: {
      name: username,
      intro:
        "You have requested to reset your password. Please click the button below to proceed. ",
      action: {
        instructions:
          "Please click the following Button to reset your password:",
        button: {
          color: "#22BC66", // Optional action button color
          text: "Reset your password",
          link: passwordResetURL,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};

export { emailVerificationMailgenContent, ForgetPasswordMailgenContent , sendEmail };

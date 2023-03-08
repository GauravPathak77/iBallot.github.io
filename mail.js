require("dotenv").config();
exports.mail = function (uemail, otp) {
  const nodemailer = require("nodemailer");

  // Nodemailer start
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.USER,
      pass: process.env.PASS,
    },
  });
  console.log("working");
  const mail_configs = {
    from: "gaurav.api.handler.1@gmail.com",
    to: uemail,
    subject: "iBallot",
    text: "Your one time password is " + otp,
  };
  console.log("created");
  transporter.sendMail(mail_configs, function (error, info) {
    console.log("Is working");
    if (error) {
      console.log(error);
      return reject({ message: `An error has occured` });
    }
    return resolve({ message: "Email sent succesfully" });
  });
  // Nodemailer end
};

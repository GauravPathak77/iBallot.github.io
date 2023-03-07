exports.mail = function(uemail,otp) {
  const nodemailer = require("nodemailer");

  // Nodemailer start
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "gaurav.api.handler.1@gmail.com",
      pass: "uqlfyrulymlyvudz",
    },
  });
  console.log("working");
  const mail_configs = {
    from: "gaurav.api.handler.1@gmail.com",
    to: uemail,
    subject: "Testing coding 101 Email",
    text: "OTP is " + otp,
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
}
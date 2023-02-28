const { mailTransport } = require("./mailTransport");

let verifyEmail = (email, firstName, lastName, otp) => {
  let params = {
    from: "no-reply@quizme.io",
    to: email,
    subject: "OTP verification",
    html: `<h1>${otp}</h1>`,
  };

  return mailTransport().sendMail(params);
};
module.exports = {
  verifyEmail,
};

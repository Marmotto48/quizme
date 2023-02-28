const { mailTransport } = require("./mailTransport");

let resetPasswordEmail = (email, resetLink, firstName) => {
  let params = {
    from: "no-reply@quizme.io",
    to: email,
    subject: "OTP verification",
    html: `<h1>Reset link</h1>
    <p>${resetLink}</p>
    <a href=${resetLink}>Click here</a>`,
  };

  return mailTransport().sendMail(params);
};
module.exports = {
  resetPasswordEmail,
};

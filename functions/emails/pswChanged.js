const { mailTransport } = require("./mailTransport");

let PswChanged = (email, firstName) => {
  let params = {
    from: "no-reply@quizme.io",
    to: email,
    subject: "Password changed.",
    html: `<h1>Password changed</h1>
    <p>firstName</p>
    `,
  };

  return mailTransport().sendMail(params);
};
module.exports = {
  PswChanged,
};

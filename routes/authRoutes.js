const {
  register,
  login,
  sendVerifEmail,
  verifyEmail,
  forgotPSWEmail,
  changePassword,
} = require("../controllers/authController");
const userAuth = require("../middleware/userAuth");

const auth = require("express").Router();

const use = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

auth.post("/register", use(register));
auth.post("/login", use(login));
auth.post("/sendverificationemail", userAuth, use(sendVerifEmail));
auth.post("/verifyemail", userAuth, use(verifyEmail));
auth.post("/forgotPSWEmail", userAuth, use(forgotPSWEmail));
auth.post("/changePassword/:token", use(changePassword));

module.exports = auth;

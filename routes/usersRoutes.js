const {
  getCUser,
  getUser,
  getUsers,
  getQuizors,
  getRegulars,
  editProfile,
  deleteProfile,
  getNotifications,
  changePsw,
  notifRead,
  deleteNotif,
} = require("../controllers/usersController");
const userAuth = require("../middleware/userAuth");

const users = require("express").Router();

const use = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

users.get("/get-user", userAuth, use(getCUser));
users.get("/get-user/:id", use(getUser));
users.get("/get-users", userAuth, use(getUsers));
users.get("/get-quizors", use(getQuizors));
users.get("/get-regulars",  use(getRegulars));
users.put("/edit-profile/:id", userAuth, use(editProfile));
users.put("/delete-profile/:id", userAuth, use(deleteProfile));
users.get("/get-notifications", userAuth, use(getNotifications));
users.post("/change-password", userAuth, use(changePsw));
users.put("/notification-read", userAuth, use(notifRead));
users.put("/delete-notification", userAuth, use(deleteNotif));

module.exports = users;

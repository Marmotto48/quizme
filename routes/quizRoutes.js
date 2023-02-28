const {
  createQuiz,
  editQuiz,
  deleteQuiz,
  joinQuiz,
  getQuiz,
  getAllQuiz,
  getUserQuiz,
  getUserJoinedQuiz,
  reportQuiz,
} = require("../controllers/quizController");
const userAuth = require("../middleware/userAuth");
const quiz = require("express").Router();
const use = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

quiz.post("/create-quiz", userAuth, use(createQuiz));
quiz.put("/edit-quiz/:id", userAuth, use(editQuiz));
quiz.put("/delete-quiz/:id", userAuth, use(deleteQuiz));
quiz.put("/join-quiz/:id", userAuth, use(joinQuiz));
quiz.get("/get-quiz", userAuth, use(getQuiz));
quiz.get("/get-all-quiz", use(getAllQuiz));
quiz.get("/get-user-quiz", userAuth, use(getUserQuiz));
quiz.get("/get-user-joined-quiz", userAuth, use(getUserJoinedQuiz));
quiz.post("/report-quiz", userAuth, use(reportQuiz));

module.exports = quiz;

const QuizModel = require("../models/quiz/quiz");
const UserModel = require("../models/users/users");
const { v4: uuidv4 } = require("uuid");
const { findOneAndUpdate } = require("../models/quiz/quiz");

module.exports = {
  // create quiz
  createQuiz: async (req, res) => {
    try {
      console.log(req.id);
      const foundUser = await UserModel.findOne({ userID: req.userID });
      if (foundUser) {
        if (foundUser.role === "regUser") {
          return res.status(401).send({
            Code: 4001,
            Description: "You are not authorized to do this action.",
            Date: new Date(),
            Success: false,
          });
        } else {
          const {
            topic,
            difficulty,
            title,
            description,
            totalScore,
            questions,
          } = req.body;

          if (questions.length <= 2) {
            return res.status(422).json({
              code: 4022,
              Description: "Missing questions",
              Date: new Date(),
              Success: false,
            });
          } else {
            // generate quiz ID
            const quizID = uuidv4();
            // admin or quizor
            const newQuiz = await QuizModel.create({
              quizID,
              topic,
              difficulty,
              title,
              description,
              totalScore,
              createdBy: req.id,
              //
              questions,
              events: {
                eventID: uuidv4(),
                quizID,
                createdBy: req.id,
                description: "A new quiz was created successfuly!",
              },
            });
            //   .populate("createdBy", "-password");

            return res.status(200).json({
              code: 2002,
              Description: "Quiz created successfuly!",
              Date: new Date(),
              Success: true,
              newQuiz,
            });
          }
        }
      } else {
        return res.status(404).send({
          Code: 4004,
          Description: "User not found",
          Date: new Date(),
          Success: false,
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        code: 5001,
        Description: "Internel error.",
        Date: new Date(),
        Success: false,
      });
    }
  },
  // edit quiz
  editQuiz: async (req, res) => {
    try {
      const quizID = req.params["id"];

      let foundQuiz = await QuizModel.findOne({
        quizID,
      }).populate({
        path: "createdBy",
        select: "firstName lastName score level avatar badge userID",
      });

      if (foundQuiz && !foundQuiz.isArchived) {
        if (foundQuiz.createdBy.userID === req.userID) {
          const {
            topic,
            difficulty,
            title,
            description,
            totalScore,
            questionID,
            question,
            choices,
            answer,
            hints,
            references,
            scorePoints,
          } = req.body;

          foundQuiz = await QuizModel.findOneAndUpdate(
            {
              quizID,
            },

            {
              topic,
              difficulty,
              title,
              description,
              totalScore,
              $push: {
                events: {
                  eventID: uuidv4(),
                  quizID,
                  createdBy: req.id,
                  description: "Quiz updated successfuly!",
                },
              },
            },
            { new: true }
          ).populate({
            path: "createdBy",
            select: "firstName lastName score level avatar  badge userID",
          });

          // if the questions are edited
          if (
            question ||
            choices ||
            answer ||
            hints ||
            references ||
            scorePoints
          ) {
            foundQuiz = await QuizModel.findOneAndUpdate(
              {
                "questions.questionID": questionID,
              },
              {
                "questions.$.question": question,
                "questions.$.choices": choices,
                "questions.$.answer": answer,
                "questions.$.hints": hints,
                "questions.$.references": references,
                "questions.$.scorePoints": scorePoints,
              },
              { new: true }
            ).populate({
              path: "createdBy",
              select: "firstName lastName score level avatar  badge userID",
            });
          }

          return res.status(200).json({
            code: 2002,
            Description: "Quiz edited successfuly!",
            Date: new Date(),
            Success: true,
            foundQuiz,
          });
        } else {
          return res.status(401).send({
            Code: 4001,
            Description: "You are not authorized to do this action.",
            Date: new Date(),
            Success: false,
          });
        }
      } else {
        // quiz not found
        return res.status(404).send({
          Code: 4004,
          Description: "Quiz not found.",
          Date: new Date(),
          Success: false,
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        code: 5001,
        Description: "Internel error.",
        Date: new Date(),
        Success: false,
      });
    }
  },
  // delete quiz
  deleteQuiz: async (req, res) => {
    try {
      const quizID = req.params["id"];

      let foundQuiz = await QuizModel.findOne({
        quizID,
      }).populate({
        path: "createdBy",
        select: "firstName lastName score level avatar  badge userID",
      });

      if (foundQuiz && !foundQuiz.isArchived) {
        if (foundQuiz.createdBy.userID === req.userID) {
          foundQuiz = await QuizModel.findOneAndUpdate(
            {
              quizID,
            },

            {
              isArchived: true,
            },
            { new: true }
          ).populate({
            path: "createdBy",
            select: "firstName lastName score level avatar  badge userID",
          });

          return res.status(200).json({
            code: 2002,
            Description: "Quiz deleted successfuly!",
            Date: new Date(),
            Success: true,
          });
        } else {
          return res.status(401).send({
            Code: 4001,
            Description: "You are not authorized to do this action.",
            Date: new Date(),
            Success: false,
          });
        }
      } else {
        // quiz not found
        return res.status(404).send({
          Code: 4004,
          Description: "Quiz not found.",
          Date: new Date(),
          Success: false,
        });
      }
    } catch (error) {
      return res.status(500).json({
        code: 5001,
        Description: "Internel error.",
        Date: new Date(),
        Success: false,
      });
    }
  },
  // join quiz
  joinQuiz: async (req, res) => {
    try {
      //
      const quizID = req.params["id"];

      const foundQuiz = await QuizModel.findOneAndUpdate(
        {
          quizID,
        },
        {
          $push: { studentsID: req.id },
        },
        { new: true }
      ).populate({
        path: "studentsID",
        select: "firstName lastName score level avatar badge userID",
      });
      return res.status(200).json({
        Code: 2002,
        Description: "User joined quiz!",
        Date: new Date(),
        Success: true,
        foundQuiz,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        code: 5001,
        Description: "Internel error.",
        Date: new Date(),
        Success: false,
      });
    }
  },
  // get quiz
  getQuiz: async (req, res) => {
    try {
    } catch (error) {
      return res.status(500).json({
        code: 5001,
        Description: "Internel error.",
        Date: new Date(),
        Success: false,
      });
    }
  },
  // get all quiz
  getAllQuiz: async (req, res) => {
    try {
      const getQuizs = await QuizModel.find({}).populate({
        path: "createdBy",
        select: "firstName lastName score level avatar badge userID",
      });

      res.json(getQuizs);
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        code: 5001,
        Description: "Internel error.",
        Date: new Date(),
        Success: false,
      });
    }
  },
  // get quiz created by user
  getUserQuiz: async (req, res) => {
    try {
    } catch (error) {
      return res.status(500).json({
        code: 5001,
        Description: "Internel error.",
        Date: new Date(),
        Success: false,
      });
    }
  },
  // get quiz joined by user
  getUserJoinedQuiz: async (req, res) => {
    try {
    } catch (error) {
      return res.status(500).json({
        code: 5001,
        Description: "Internel error.",
        Date: new Date(),
        Success: false,
      });
    }
  },
  // report
  reportQuiz: async (req, res) => {
    try {
    } catch (error) {
      return res.status(500).json({
        code: 5001,
        Description: "Internel error.",
        Date: new Date(),
        Success: false,
      });
    }
  },
};

const mongoose = require("mongoose");
const { Schema } = mongoose;

const Event = new Schema(
  {
    eventID: {
      type: String,
      required: true,
    },
    quizID: {
      type: mongoose.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    description: {
      type: String,
      required: true,
      default: "",
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Question = new Schema(
  {
    questionID: {
      type: String,
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    choices: {
      type: String,
      enum: [""],
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    hints: {
      type: String,
      default: "",
    },
    references: {
      type: String,
      default: "",
    },
    scorePoints: {
      type: Number,
      required: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Quiz = new Schema(
  {
    quizID: {
      type: String,
      required: true,
      index: { unique: true },
    },
    topic: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    studentsID:
      //   type: [mongoose.Types.ObjectId],
      [{ type: Schema.ObjectId, ref: "Users", default: [] }],

    difficulty: {
      type: String,
      enum: ["simple", "medium", "hard"],
      default: "simple",
      required: true,
    },
    questions: { type: Array, default: [Question] },
    title: {
      type: String,
      default: "",
      required: true,
    },
    description: {
      type: String,
      default: "",
      required: true,
    },
    totalScore: {
      type: Number,
      default: 10,
      required: true,
    },
    events: { type: Array, default: [Event] },
    isArchived: {
      type: Boolean,
      default: false,
      required: true,
    },
  },

  { timestamps: { createdAt: true, updatedAt: true } }
);

const QuizModel = mongoose.model("Quiz", Quiz);
module.exports = QuizModel;

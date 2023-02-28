const mongoose = require("mongoose");
const { Schema } = mongoose;

const Notification = new Schema(
  {
    id: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
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

const User = new Schema(
  {
    userID: {
      type: String,
      required: true,
      index: { unique: true },
    },
    role: {
      type: String,
      enum: ["regUser", "quizor", "admin"],
      default: "regUser",
      required: true,
    },
    userEmail: {
      token: { type: String, default: "" },
      email: { type: String, required: true, default: "" },
      isVerified: { type: Boolean, Default: false },
      tries: { type: Number, default: 0 },
    },
    userPhoneNumber: {
      phoneNumber: { type: Number, default: "" },
      isVerified: { type: Boolean, Default: false },
      tries: { type: Number, default: 0 },
    },
    password: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      default: "",
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      default: "unkonwn",
    },
    country: {
      type: String,
      default: "unkonwn",
    },
    score: {
      type: Number,
      required: true,
      default: 0,
    },
    level: {
      type: Number,
      required: true,
      default: 0,
    },
    avatar: {
      type: String,
      required: true,
      default:
        "data:image/png;base64,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",
    },
    badge: {
      type: String,
      required: true,
      default: "none",
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    loginHistory: [
      {
        type: new mongoose.Schema(
          {
            id: String,
            ip: String,
            device: String,
          },
          { timestamps: { createdAt: true, updatedAt: false } }
        ),
      },
    ],
    paymentHistory: {
      type: Array,
      required: true,
      default: [],
    },
    // quizHistory: {
    //   type: Array,
    //   required: true,
    //   default: [],
    // },
    quizHistory: [
      {
        quizID: { type: mongoose.Types.ObjectId, ref: "Quiz" },
        progress: {
          type: String,
          enum: ["completed", "ongoing", "dropped", "suspended"],
          default: "ongoing",
          required: true,
        },
        currentQuestion: {
          type: Number,
          default: 0,
        },
        score: {
          type: Number,
          default: 0,
        },
        createdAt: {
          type: Date,
          default: new Date(),
        },
      },
    ],
    // notifications: [
    //   {
    //     type: new Schema(
    //       {
    //         id: {
    //           type: String,
    //           required: true,
    //         },
    //         content: {
    //           type: String,
    //           required: true,
    //         },
    //         isRead: {
    //           type: Boolean,
    //           default: false,
    //           required: true,
    //         },
    //         isArchived: false,
    //       },
    //       { timestamps: { createdAt: true, updatedAt: false } }
    //     ),
    //   },
    // ],
    notifications: { type: Array, default: [Notification] },

    authMethod: {
      type: String,
      enum: ["normal", "google", "facebook"],
      required: true,
      default: "normal",
    },
    isPremium: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

const UserModel = mongoose.model("Users", User);
module.exports = UserModel;

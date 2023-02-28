const express = require("express");
const morgan = require("morgan");
cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const users = require("./routes/usersRoutes");
const auth = require("./routes/authRoutes");
const connectDB = require("./config/connectDB");
const {
  ValidationError,
  NotFoundError,
  DBError,
  ConstraintViolationError,
  UniqueViolationError,
  NotNullViolationError,
  ForeignKeyViolationError,
  CheckViolationError,
  DataError,
} = require("objection");
const requestSession = require("express-session");
const quiz = require("./routes/quizRoutes");

// enviroment
require("dotenv").config();

// app
const app = express();
app.use(cors());
app.use(
  requestSession({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
  })
);

// middlewares
app.use(morgan("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 100000,
  })
);
app.use(cookieParser());

// routes
app.use("/v1/", auth);
app.use("/v1/", users);
app.use("/v1/", quiz);
app.use(async function (err, req, res, next) {
  augmentObjectionError(err);
  const { message, status = null } = err;
  res.status(Number(err.status) || 500).json({
    code: status,
    description: message,
  });
});

// errors
function augmentObjectionError(err, res) {
  if (err instanceof ValidationError) {
    err.status = 400;
  } else if (err instanceof NotFoundError) {
    err.status = 404;
  } else if (err instanceof UniqueViolationError) {
    err.status = 409;
  } else if (err instanceof NotNullViolationError) {
    err.status = 400;
  } else if (err instanceof ForeignKeyViolationError) {
    err.status = 409;
  } else if (err instanceof CheckViolationError) {
    err.status = 400;
  } else if (err instanceof ConstraintViolationError) {
    err.status = 409;
  } else if (err instanceof DataError) {
    err.status = 400;
  } else if (err instanceof DBError) {
    err.status = 500;
  } else {
    err.status = 500;
  }
}

//db Connect
connectDB();

//port
port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

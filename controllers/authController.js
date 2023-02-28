const UserModel = require("../models/users/users");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const saltRounds = 10;
const { OAuth2Client } = require("google-auth-library");
const { verifyEmail } = require("../functions/emails/verifyEmailver2");
const {
  resetPasswordEmail,
} = require("../functions/emails/resetPasswordEmail");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const bcrypt = require("bcrypt");
const { generateOTP } = require("../functions/otp/generateOTP");

module.exports = {
  // create new account
  register: async (req, res) => {
    try {
      const {
        role,
        email,
        // phoneNumber,
        password,
        firstName,
        lastName,
        address,
        country,
      } = req.body;

      // unique email
      const searchEmail = await UserModel.findOne({
        "userEmail.email": email.toLowerCase().trim(),
      });
      // if email already exists
      if (searchEmail) {
        return res.status(400).send({
          Code: 4003,
          Description: "User already exists",
          Date: new Date(),
          Success: false,
        });
      }
      // if email new
      const userID = uuidv4();

      // generate otp
      const otp = generateOTP();

      // create new user
      const newUser = await UserModel.create({
        userID,
        role,
        "userEmail.email": email,
        // "userPhoneNumber.phoneNumber": phoneNumber,
        password: await bcrypt.hash(password, saltRounds),
        firstName,
        lastName,
        address,
        country,
        // add to loginHistory
        loginHistory: {
          id: uuidv4(),
          ip: req.socket.remoteAddress,
          device: req.headers["user-agent"],
        },
        // create notification
        notifications: {
          id: uuidv4(),
          content: "First Login welcome msg.",
        },
        otp: await bcrypt.hash(otp, saltRounds),
      });

      // create token
      const token = jwt.sign(
        {
          id: newUser.id,
          email,
          name: firstName + lastName,
          userID: userID,
          loginDate: new Date(),
          isLocked: false,
          sessionID: uuidv4(),
        },
        process.env.SECRET_KEY
      );

      // send verification otp email
      await verifyEmail(email, firstName, lastName, otp);

      // return success
      return res.status(200).json({
        Code: 1002,
        User: newUser,
        token,
        Description: `Registered successfully !`,
        Date: new Date(),
        Success: true,
      });
      //   }
    } catch (error) {
      res.status(500).json({
        Code: 5001,
        Description: `Cannot create account ! ${error}`,
        Date: new Date(),
        Success: false,
      });
    }
  },

  // login user
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      //   find if the user exist
      let foundUser;
      foundUser = await UserModel.findOne({ "userEmail.email": email });

      //if the email does not exist
      if (!foundUser) {
        return res.status(400).send({
          Code: 4004,
          Description:
            "This account dosen't exist please check your email, or create a new account.",
          Date: new Date(),
          Success: false,
        });
      }

      // match password
      const match = await bcrypt.compare(password, foundUser.password);

      if (!match) {
        return res.status(400).send({
          Code: 4005,
          Description: "Please check your email or password..",
          Date: new Date(),
          Success: false,
        });
      } else {
        // login
        // add to login history
        foundUser = await UserModel.findOneAndUpdate(
          { "userEmail.email": email },
          {
            $push: {
              loginHistory: {
                id: uuidv4(),
                ip: req.socket.remoteAddress,
                device: req.headers["user-agent"],
              },
            },
          },
          { new: true }
        );

        // generate token
        const token = jwt.sign(
          {
            id: foundUser.id,
            email,
            Name: foundUser.firstName,
            userID: foundUser.userID,
            loginDate: new Date(),
            isLocked: false,
            sessionID: uuidv4(),
          },
          process.env.SECRET_KEY
        );
        return res.status(200).send({
          Code: 1002,
          User: foundUser,
          token,
          Description: `Login successfully !`,
          Date: new Date(),
          Success: true,
        });
      }
    } catch (error) {
      res.status(500).json({
        Code: 5001,
        Description: `Cannot login to account ! ${error}`,
        Date: new Date(),
        Success: false,
      });
    }
  },

  // resend verification email
  sendVerifEmail: async (req, res) => {
    try {
      let foundUser = await UserModel.findOne({
        userID: req.userID,
      });
      if (foundUser) {
        // generate otp
        const otp = generateOTP();
        await UserModel.findOneAndUpdate(
          { userID: req.userID },
          { otp: await bcrypt.hash(otp, saltRounds) },
          { new: true }
        );

        // send verification email
        await verifyEmail(
          foundUser.userEmail.email,
          foundUser.firstName,
          foundUser.lastName,
          otp
        );

        return res.status(200).send({
          Code: 2002,
          Description: "Verification email sent.",
          Date: new Date(),
          Success: true,
        });
      } else {
        return res.status(404).send({
          Code: 4004,
          Description: "User not found!",
          Date: new Date(),
          Success: false,
        });
      }
    } catch (error) {
      return res.status(500).send({
        Code: 5001,
        Description: "Cannot send verification email.",
        Date: new Date(),
        Success: false,
      });
    }
  },

  // verify email
  verifyEmail: async (req, res) => {
    try {
      const { otp } = req.body;
      let foundUser = await UserModel.findOne({
        userID: req.userID,
      });
      if (foundUser) {
        if (foundUser.isVerified) {
          return res.status(404).send({
            Code: 4004,
            Description: "User is already verified.",
            Date: new Date(),
            Success: false,
          });
        } else {
          const match = await bcrypt.compare(otp, foundUser.otp);
          if (match) {
            let foundUser = await UserModel.findOneAndUpdate(
              {
                userID: req.userID,
              },
              {
                "userEmail.isVerified": true,
                isVerified: true,
                otp: "",
                $push: {
                  notifications: {
                    id: uuidv4(),
                    content: "Email verified.",
                  },
                },
              },
              { new: true }
            );

            // verify account

            res.status(200).send({
              Code: 2002,
              Description: "Email confirmed.",
              Date: new Date(),
              Success: true,
              user: foundUser,
            });
          } else {
            return res.status(500).send({
              Code: 5001,
              Description: "OTP does not match.",
              Date: new Date(),
              Success: false,
            });
          }
        }
      } else {
        return res.status(404).send({
          Code: 4004,
          Description: "User not found.",
          Date: new Date(),
          Success: false,
        });
      }
    } catch (error) {
      res.status(500).json({
        Code: 5001,
        Description: "Cannot verify account!",
        Date: new Date(),
        Success: false,
      });
    }
  },

  // forgotten password send to email
  forgotPSWEmail: async (req, res) => {
    try {
      // provide existing email
      const { email } = req.body;
      let foundUser = await UserModel.findOne({
        "userEmail.email": email.toLowerCase(),
      });
      if (foundUser) {
        // generate token
        const token = await jwt.sign(
          {
            userID: foundUser.userID,
            email,
            authMethod: foundUser.authMethod,
            subject: "resetPassword",
            queryDate: new Date(),
          },
          process.env.SECRET_KEY,
          { expiresIn: "24h" }
        );

        // create reset link
        const resetLink = `${process.env.APP_URL}/reset-password/${token}`;

        // save token
        foundUser.userEmail.token = token;
        foundUser.userEmail.tries++;
        await foundUser.save();

        // send link by email
        await resetPasswordEmail(
          foundUser.userEmail.email,
          resetLink,
          foundUser.firstName
        );

        res.status(200).send({
          Code: 1001,
          Description: `${foundUser.firstName}, reset password link sent to ${foundUser.userEmail.email}`,
          Date: new Date(),
          Success: true,
        });
      } else {
        return res.status(400).send({
          Code: 4008,
          Description: "no user with this email exist !",
          Date: new Date(),
          Success: false,
        });
      }
    } catch (error) {
      res.status(500).json({
        Code: 5001,
        Description: "Cannot send reset password link!",
        Date: new Date(),
        Success: false,
      });
    }
  },

  // change password
  changePassword: async (req, res) => {
    try {
      const { newPassword } = req.body;
      const token = req.params.token.split("/v1/reset-password/").join("");
      const decoded = jwt.verify(token, process.env.SECRET_KEY);

      let foundUser = await UserModel.findOne({
        "userEmail.email": decoded.email,
        userID: decoded.userID,
        authMethod: decoded.authMethod,
      });

      if (foundUser) {
        if (
          decoded.subject === "resetPassword" &&
          foundUser.userEmail.token === token
        ) {
          foundUser = await UserModel.findOneAndUpdate(
            {
              userID: decoded.userID,
            },
            {
              password: await bcrypt.hash(newPassword, saltRounds),
              "userEmail.token": "",
              // create notification
              notifications: {
                id: uuidv4(),
                content: "Password changed successfuly.",
              },
            }
          );
          res.status(200).json({
            code: 2001,
            Description: "Password changed succefuly.",
            Date: new Date(),
            Success: true,
          });
        } else {
          res.status(401).send({
            code: 401,
            description: "Something went wrong ! Please send the email again.",
            Date: new Date(),
            Success: false,
          });
        }
      } else {
        res.status(404).json({
          code: 4004,
          Description: "User not found.",
          Date: new Date(),
          Success: false,
        });
      }
    } catch (error) {
      res.status(500).json({
        code: 5001,
        Description: "Cannot change password, please try again.",
        Date: new Date(),
        Success: false,
      });
    }
  },

  // Google singin/signup
  googleAuth: async (req, res) => {},
  // Facebook singin/signup
  facebookAuth: async (req, res) => {},
  // change password from within the dashboard
  // sendConfirmation code to Phone
  sendVerifPhone: async (req, res) => {},
  // confirm phone
  verifyPhone: async (req, res) => {},
};

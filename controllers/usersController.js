const { PswChanged } = require("../functions/emails/pswChanged");
const { findOneAndUpdate } = require("../models/users/users");
const UserModel = require("../models/users/users");
const { v4: uuidv4 } = require("uuid");

module.exports = {
  // get connected user
  getCUser: async (req, res) => {
    try {
      const foundUser = await UserModel.findOne({
        userID: req.userID,
      }).select("-password");

      if (foundUser) {
        return res.status(200).send({
          Code: 2002,
          Description: "Fetched user",
          Date: new Date(),
          Success: true,
          foundUser,
        });
      } else {
        return res.status(404).send({
          Code: 4004,
          Description: "User not found",
          Date: new Date(),
          Success: false,
        });
      }
    } catch (error) {
      return res.status(500).json({
        Code: 5001,
        Description: `Internel server error`,
        Date: new Date(),
        Success: false,
      });
    }
  },

  // get user
  getUser: async (req, res) => {
    try {
      const userID = req.params["id"];
      const foundUser = await UserModel.findOne({
        userID,
        isActive: true,
      }).select("-password");

      if (foundUser) {
        // add if the user is archived
        return res.status(200).send({
          Code: 2002,
          Description: "Fetched user",
          Date: new Date(),
          Success: true,
          foundUser,
        });
      } else {
        return res.status(404).send({
          Code: 4004,
          Description: "User not found",
          Date: new Date(),
          Success: false,
        });
      }
    } catch (error) {
      return res.status(500).json({
        Code: 5001,
        Description: `Internel server error`,
        Date: new Date(),
        Success: false,
      });
    }
  },
  // get users
  getUsers: async (req, res) => {
    try {
      const foundUsers = await UserModel.find({
        $and: [
          { role: { $ne: "Admin" } },
          { id: { $ne: req.userID }, isActive: true },
        ],
      }).select("-password");

      if (foundUsers) {
        return res.status(200).send({
          Code: 2002,
          Description: "Fetched user",
          Date: new Date(),
          Success: true,
          foundUsers,
        });
      } else {
        return res.status(404).send({
          Code: 4004,
          Description: "Quizors not found.",
          Date: new Date(),
          Success: false,
        });
      }
    } catch (error) {
      return res.status(500).json({
        Code: 5001,
        Description: `Internel server error`,
        Date: new Date(),
        Success: false,
      });
    }
  },
  // get quizors
  getQuizors: async (req, res) => {
    try {
      const foundQuizors = await UserModel.find({
        role: "quizor",
        isActive: true,
      }).select("-password");
      if (foundQuizors) {
        return res.status(200).send({
          Code: 2002,
          Description: "Fetched user",
          Date: new Date(),
          Success: true,
          foundQuizors,
        });
      } else {
        return res.status(404).send({
          Code: 4004,
          Description: "Quizors not found.",
          Date: new Date(),
          Success: false,
        });
      }
    } catch (error) {
      return res.status(500).json({
        Code: 5001,
        Description: `Internel server error`,
        Date: new Date(),
        Success: false,
      });
    }
  },

  // get regulars
  getRegulars: async (req, res) => {
    try {
      const foundRegulars = await UserModel.find({
        role: "regUser",
        isActive: true,
      }).select("-password");
      if (foundRegulars) {
        return res.status(200).send({
          Code: 2002,
          Description: "Fetched users",
          Date: new Date(),
          Success: true,
          foundRegulars,
        });
      } else {
        return res.status(404).send({
          Code: 4004,
          Description: "Quizors not found.",
          Date: new Date(),
          Success: false,
        });
      }
    } catch (error) {
      return res.status(500).json({
        Code: 5001,
        Description: `Internel server error`,
        Date: new Date(),
        Success: false,
      });
    }
  },

  // edit profile
  editProfile: async (req, res) => {
    try {
      const userID = req.params["id"];

      const foundUser = await UserModel.findOne({
        userID: userID,
      }).select("-password");
      if (foundUser) {
        if (foundUser.userID === req.userID) {
          // authorized
          const { firstName, lastName, address, country } = req.body;
          // empty body
          // empty firstName/lastName
          if (
            (!firstName && !lastName && !address && !country) ||
            firstName === "" ||
            lastName === ""
          ) {
            return res.status(404).send({
              code: 4004,
              Description: "No new changes to be updated.",
              Date: new Date(),
              Success: false,
              foundUser,
            });
          } else {
            const updateProfile = await UserModel.findOneAndUpdate(
              { userID: req.userID, isActive: true },
              {
                firstName,
                lastName,
                address,
                country,
              },
              { new: true }
            ).select("-password");
            return res.status(200).send({
              code: 2002,
              Description: "User profile updated successfuly.",
              Date: new Date(),
              Success: true,
              updateProfile,
            });
          }
        } else {
          // not authorized
          return res.status(401).send({
            Code: 4001,
            Description: "You are not authorized for this action.",
            Date: new Date(),
            Success: false,
          });
        }
      } else {
        return res.status(404).send({
          Code: 4004,
          Description: "Quizors not found.",
          Date: new Date(),
          Success: false,
        });
      }
    } catch (error) {
      return res.status(500).json({
        Code: 5001,
        Description: `Internel server error`,
        Date: new Date(),
        Success: false,
      });
    }
  },

  // delete profile
  deleteProfile: async (req, res) => {
    try {
      const userID = req.params["id"];

      let foundUser = await UserModel.findOne({
        userID: userID,
      }).select("-password");
      if (foundUser) {
        if (foundUser.userID === req.userID) {
          let foundUser = await UserModel.findOneAndUpdate(
            { userID: req.userID },
            {
              isActive: false,
            },
            { new: true }
          ).select("-password");
          return res.status(200).send({
            code: 2002,
            Description: "User profile deleted successfuly.",
            Date: new Date(),
            Success: true,
            foundUser,
          });
        }
      } else {
        // not found
        return res.status(404).send({
          code: 4004,
          Description: "User not found.",
          Date: new Date(),
          Success: false,
        });
      }
    } catch (error) {
      return res.status(500).json({
        Code: 5001,
        Description: `Internel server error`,
        Date: new Date(),
        Success: false,
      });
    }
  },

  // get notifications
  getNotifications: async (req, res) => {
    try {
      const foundUser = await UserModel.findOne({ userID: req.userID }).select(
        "-password"
      );
      if (foundUser) {
        const notifications = foundUser.notifications.filter(
          (notification) => notification.isArchived === false
        );
        return res.status(200).json({
          code: 2002,
          Description: "Get all notifications.",
          Success: true,
          notifications,
        });
      } else {
        return res.status(404).json({
          code: 4004,
          Description: "User not found.",
          Success: false,
        });
      }
    } catch (error) {
      return res.status(500).json({
        Code: 5001,
        Description: `Internel server error`,
        Date: new Date(),
        Success: false,
      });
    }
  },

  // mark notification as read
  notifRead: async (req, res) => {
    try {
      const { notifID } = req.body;
      let foundUser = UserModel.findOne({ userID: req.userID });
      if (foundUser) {
        if (notifID) {
          // mark one notification as read
          foundUser = await UserModel.findOneAndUpdate(
            {
              $and: [
                { userID: req.userID },
                { "notifications.id": notifID },
                { "notifications.isRead": false },
                { "notifications.isArchived": false },
              ],
            },
            { $set: { "notifications.$.isRead": true } },
            { new: true }
          ).select("-password");

          return res.status(200).send({
            Code: 2002,
            Description: "Notification marked as read.",
            Date: new Date(),
            Success: true,
            notifications: foundUser.notifications,
          });
          // mark all notification as read
        } else {
          let foundUser = await UserModel.findOneAndUpdate(
            {
              $and: [
                { userID: req.userID },
                { "notifications.isRead": false },
                { "notifications.isArchived": false },
              ],
            },
            { $set: { "notifications.$.isRead": true } },
            { new: true }
          ).select("-password");
          return res.status(200).send({
            Code: 2002,
            Description: "Notifications marked as read.",
            Date: new Date(),
            Success: true,
            notifications: foundUser.notifications,
          });
        }
      } else {
        return res.status(404).json({
          code: 4004,
          Description: "User not found.",
          Success: false,
        });
      }
    } catch (error) {
      return res.status(500).json({
        Code: 5001,
        Description: `Internel server error`,
        Date: new Date(),
        Success: false,
      });
    }
  },
  // delete notification
  deleteNotif: async (req, res) => {
    try {
      const { notifID } = req.body;
      if (!notifID)
        return res.status(404).json({
          code: 4004,
          Description: "Notification ID missing.",
          Success: false,
        });
      let foundUser = UserModel.findOne({ userID: req.userID }).select(
        "-password"
      );

      if (foundUser) {
        // delete notification
        let foundUser = await UserModel.findOneAndUpdate(
          {
            userID: req.userID,
            "notifications.id": notifID,
          },
          { $set: { "notifications.$.isArchived": true } },
          { new: true }
        ).select("-password");

        if (foundUser) {
          return res.status(202).json({
            code: 2002,
            Description: "Notification deleted successfuly.",
            Success: true,
            notifications: foundUser.notifications.filter(
              (notification) => notification.isArchived === false
            ),
          });
        } else {
          return res.status(404).json({
            code: 4004,
            Description:
              "Notification not found or you don't have the authorization to do this action.",
            Success: false,
          });
        }
      } else {
        return res.status(404).json({
          code: 4004,
          Description: "User not found.",
          Success: false,
        });
      }
    } catch (error) {
      return res.status(500).json({
        Code: 5001,
        Description: `Internel server error`,
        Date: new Date(),
        Success: false,
      });
    }
  },

  // change password
  changePsw: async (req, res) => {
    try {
      let foundUser = await findOne({ userID: req.userID }).select("-password");
      if (foundUser) {
        const { newPassword, confirmNewPassword, currentPassword } = req.body;
        if (newPassword === confirmNewPassword) {
          // compare old password
          const testCurrentPass = await bcrypt.compare(
            currentPassword,
            foundUser.password
          );
          if (testCurrentPass) {
            // compare if the new password is the same as the old one
            const testNewPass = await bcrypt.compare(
              newPassword,
              foundUser.password
            );
            if (!testNewPass) {
              foundUser = await findOneAndUpdate(
                { userID: req.userID },
                {
                  password: await bcrypt.hash(newPassword, saltRounds),
                  // create notification
                  $push: {
                    notifications: {
                      id: uuidv4(),
                      content: "First Login welcome msg.",
                    },
                  },
                }
              ).select("-password");
              res.status(200).send({
                Code: 2002,
                Description: "Password changed successfuly!",
                Date: new Date(),
                Success: true,
              });
              // send email
              await PswChanged(foundUser.userEmail.email);
            } else {
              res.status(406).send({
                code: 406,
                description: "Your new password cannot be your old one",
              });
            }
          } else {
            res.status(406).send({
              code: 406,
              description: "Password doesn't match your current one",
            });
          }
        } else {
          res.status(406).send({
            code: 406,
            description: "Your new passwords don't match",
          });
        }
      } else {
        return res.status(404).send({
          Code: 4004,
          Description: "User not found",
          Date: new Date().toUTCString(),
          Success: false,
        });
      }
    } catch (error) {
      return res.status(500).json({
        Code: 5001,
        Description: `Internel server error`,
        Date: new Date(),
        Success: false,
      });
    }
  },
  // paymentWebHook
};

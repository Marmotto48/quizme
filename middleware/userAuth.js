const jwt = require("jsonwebtoken");

const userAuth = async (req, res, next) => {
  try {
    const token = req.headers["token"];
    if (token) {
      const verifiedToken = await jwt.verify(token, process.env.SECRET_KEY);
      if (!verifiedToken)
        res.status(401).json({ msg: "You are not authorized or this action." });
      req.userID = verifiedToken.userID;
      req.id = verifiedToken.id;
      // console.log(verifiedToken);
      next();
    } else {
      return res.status(404).send({
        Code: 4007,
        Description: "Please provide the necessary credentials !",
        Date: new Date(),
        Success: false,
      });
    }
  } catch (error) {
    res.status(500).json({ msg: error });
    console.log(error);
  }
};

module.exports = userAuth;

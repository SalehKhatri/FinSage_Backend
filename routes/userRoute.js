const express = require("express");
const { body } = require("express-validator");
const { authUser } = require("../middleware/authUser");
const {
  handleUserSignUp,
  handleUserSignIN,
  getUser,
} = require("../controllers/user");

const router = express.Router();

// Route to signup a new user

router.post(
  "/signup",
  [
    body("firstname").isLength({ min: 3 }),
    body("lastname").isLength({ min: 3 }),
    body("username").isLength({ min: 3 }),
    body("email").isEmail(),
    body("password").isLength({ min: 5 }), //Validation the data to be entered in db with help of express validator package
  ],
  handleUserSignUp
);

// Route to login a existing user
router.post(
  "/login",
  [
    body("email").isEmail(),
    body("password", "Cannot be blank").exists(), //Validation the data to be entered in db with help of express validator package
  ],
  handleUserSignIN
);

// Route to get userinfo with help of authtoken
router.get("/getuser", authUser, getUser);

module.exports = router;

const User = require("../models/User");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

require("dotenv").config();

async function handleUserSignUp(req, res) {
  const { firstname, lastname, username, email, password } = req.body;
  const salt = await bcrypt.genSalt(10); //Encrypting the password with bcrypt
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return res.status(400).json({ error: error });
  }

  try {
    encyptedPass = await bcrypt.hash(password, salt);
    const user = await User.create({
      firstname: firstname,
      lastname: lastname,
      username: username,
      email: email,
      password: encyptedPass,
    });

    const data = {
      user: {
        id: user.id,
      },
    };
    const authtoken = jwt.sign(data, process.env.JWT_SECRET);
    return res.status(200).json({ token: authtoken });
  } catch (e) {
    if (e.code === 11000) {
      return res.status(400).json({ error: "Email already exists" });
    }
    return res.json({ error: e });
  }
}

async function handleUserSignIN(req, res) {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return res.status(400).json({ error: error });
  }
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Incorrect credentials" });
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      return res.status(400).json({ error: "Incorrect credentials" });
    }

    const data = {
      user: {
        id: user.id,
      },
    };
    const authtoken = jwt.sign(data, process.env.JWT_SECRET);
    return res.status(200).json({ token: authtoken });
  } catch (e) {
    return res.status(500).json({ error: e });
  }
}

async function getUser(req, res) {
  userId = req.user.id;

  const user = await User.findById(userId).select("-password");
  res.send(user);
}

module.exports = { handleUserSignUp, handleUserSignIN, getUser };

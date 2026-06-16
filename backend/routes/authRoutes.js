const express = require("express");

const router = express.Router();

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const User = require("../models/User");


// REGISTER

router.post("/register", async (req, res) => {

  try {

    const {
      name,
      email,
      password,
      role,
      clubName
    } = req.body;

    const existingUser =
      await User.findOne({ email });

    if(existingUser){

      return res.status(400).json({
        message: "User already exists"
      });

    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user = new User({

      name,

      email,

      password: hashedPassword,

      role,

      clubName

    });

    await user.save();

    res.json({
      message: "Registered Successfully"
    });

  } catch (err) {

    res.status(500).json(err);

  }

});


// LOGIN

router.post("/login", async (req, res) => {

  try {

    const { email, password } = req.body;

    const user =
      await User.findOne({ email });

    if(!user){

      return res.status(400).json({
        message: "User not found"
      });

    }

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if(!isMatch){

      return res.status(400).json({
        message: "Wrong Password"
      });

    }

    const token = jwt.sign(

      {
        id: user._id,
        role: user.role
      },

      process.env.JWT_SECRET

    );

    res.json({

      token,

      user

    });

  } catch (err) {
    res.status(500).json(err);
  }
});

// GET all users (admin overview)
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a user
router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
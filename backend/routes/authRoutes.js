const express = require("express");

const router = express.Router();

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const User = require("../models/user");


// REGISTER

router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      clubName,
      collegeName,
      rollNumber,
      mobileNumber
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      clubName: role === "club" ? clubName : undefined,
      collegeName: role === "club" ? collegeName : undefined,
      rollNumber: role === "student" ? rollNumber : undefined,
      mobileNumber: role === "student" ? mobileNumber : undefined
    });

    await user.save();
    res.json({
      message: "Registered Successfully"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
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

// FORGOT/RESET PASSWORD
router.post("/forgot-password", async (req, res) => {
  try {
    const { email, name, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User account not found with this email" });
    }
    // Verify name matches for basic security verification
    if (user.name.toLowerCase() !== name.toLowerCase()) {
      return res.status(400).json({ message: "Verification failed. Full Name does not match." });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    res.json({ message: "Password reset successfully. You can now login with your new password." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// RESET Database (Clear all bookings and events)
router.post("/reset-db", async (req, res) => {
  try {
    const Booking = require("../models/Booking");
    const Event = require("../models/Event");
    await Booking.deleteMany({});
    await Event.deleteMany({});
    res.json({ message: "All events and bookings have been cleared successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

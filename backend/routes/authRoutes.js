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
      collegeName: (role === "club" || role === "student") ? collegeName : undefined,
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

    user.isOnline = true;
    user.lastActive = new Date();
    await user.save();

    res.json({
      token,
      user
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
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

// GET single user profile
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id, "-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
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

const Stats = require("../models/Stats");

// HEARTBEAT
router.post("/heartbeat", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId required" });
    const user = await User.findById(userId);
    if (user) {
      user.lastActive = new Date();
      user.isOnline = true;
      await user.save();
      return res.json({ success: true, isOnline: user.isOnline });
    }
    res.status(404).json({ error: "User not found" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGOUT STATUS
router.post("/logout-status", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId required" });
    const user = await User.findById(userId);
    if (user) {
      user.isOnline = false;
      await user.save();
      return res.json({ success: true });
    }
    res.status(404).json({ error: "User not found" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TRACK VISIT (ANALYTICS)
router.post("/track-visit", async (req, res) => {
  try {
    const { isNewSession } = req.body;
    let stats = await Stats.findOne({ key: "global_stats" });
    if (!stats) {
      stats = new Stats({ key: "global_stats", pageViews: 0, uniqueVisitors: 0 });
    }
    stats.pageViews += 1;
    if (isNewSession) {
      stats.uniqueVisitors += 1;
    }
    await stats.save();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ANALYTICS STATS
router.get("/stats", async (req, res) => {
  try {
    let stats = await Stats.findOne({ key: "global_stats" });
    if (!stats) {
      stats = { pageViews: 0, uniqueVisitors: 0 };
    }

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const activeUsersCount = await User.countDocuments({
      isOnline: true,
      lastActive: { $gt: fiveMinutesAgo }
    });

    res.json({
      pageViews: stats.pageViews,
      uniqueVisitors: stats.uniqueVisitors,
      activeUsers: activeUsersCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE A USER (ADMIN CRUD)
router.post("/users", async (req, res) => {
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
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      clubName: role === "club" ? clubName : undefined,
      collegeName: (role === "club" || role === "student") ? collegeName : undefined,
      rollNumber: role === "student" ? rollNumber : undefined,
      mobileNumber: role === "student" ? mobileNumber : undefined,
      isOnline: false,
      lastActive: new Date()
    });

    await user.save();
    res.json({ message: "User created successfully", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE A USER (ADMIN CRUD)
router.put("/users/:id", async (req, res) => {
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

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.clubName = role === "club" ? (clubName || user.clubName) : undefined;
    user.collegeName = (role === "club" || role === "student") ? (collegeName || user.collegeName) : undefined;
    user.rollNumber = role === "student" ? (rollNumber || user.rollNumber) : undefined;
    user.mobileNumber = role === "student" ? (mobileNumber || user.mobileNumber) : undefined;

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    res.json({ message: "User updated successfully", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

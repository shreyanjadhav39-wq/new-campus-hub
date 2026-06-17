const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true
  },
  password: String,
  role: String,
  clubName: String,
  collegeName: String,
  rollNumber: String,
  mobileNumber: String
});

module.exports = mongoose.model("User", userSchema);
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  eventId: {
    type: String,
    required: true
  },
  eventName: {
    type: String,
    required: true
  },
  clubId: {
    type: String,
    required: true
  },
  screenshot: {
    type: String,
    required: true
  },
  eventPrice: {
    type: Number,
    required: false
  },
  eventDate: {
    type: String,
    required: false
  },
  eventVenue: {
    type: String,
    required: false
  },
  status: {
    type: String,
    default: "Pending"
  }
});

module.exports = mongoose.model("Booking", bookingSchema);
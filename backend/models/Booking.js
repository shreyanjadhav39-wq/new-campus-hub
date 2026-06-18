const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: false
  },
  studentId: {
    type: String,
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  studentEmail: {
    type: String,
    required: true
  },
  studentMobile: {
    type: String,
    required: true
  },
  studentRollNumber: {
    type: String,
    required: true
  },
  studentCollegeName: {
    type: String,
    required: true
  },
  collegeName: {
    type: String,
    required: false
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
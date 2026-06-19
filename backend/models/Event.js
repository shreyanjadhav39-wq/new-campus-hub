const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: String,
  venue: String,
  date: String,
  startTime: String,
  price: Number,
  seats: Number,
  seatsLeft: Number,
  createdBy: String,
  clubName: String,
  collegeName: String,
  category: {
    type: String,
    default: "General"
  },
  description: String,
  bannerImage: String,
  paymentType: {
    type: String,
    default: "default"
  },
  paymentLink: String,
  paymentQR: String
});

module.exports = mongoose.model("Event", eventSchema);
const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: String,
  venue: String,
  date: String,
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
  paymentType: {
    type: String,
    default: "default"
  },
  paymentLink: String,
  paymentQR: String
});

module.exports = mongoose.model("Event", eventSchema);
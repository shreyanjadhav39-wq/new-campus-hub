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

  category: {
    type: String,
    default: "General"
  }

});

module.exports =
  mongoose.model("Event", eventSchema);
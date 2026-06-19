const mongoose = require("mongoose");

const statsSchema = new mongoose.Schema({
  key: {
    type: String,
    default: "global_stats",
    unique: true
  },
  pageViews: {
    type: Number,
    default: 0
  },
  uniqueVisitors: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("Stats", statsSchema);

const mongoose = require("mongoose");

const TrafficSchema = new mongoose.Schema({
  location: String, // Replace with actual location format
  congestionLevel: Number, // Store traffic congestion level
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("TrafficData", TrafficSchema);

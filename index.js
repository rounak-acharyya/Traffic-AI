const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const axios = require("axios");
const { spawn } = require("child_process"); // Added for AI model execution

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Connection - Ensure you have a valid URI in .env
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Connection Error:", err));

// Define Traffic Data Schema and Model
const TrafficSchema = new mongoose.Schema({
  start: String,
  end: String,
  distance: Number,
  duration: Number,
  trafficData: Object,
  timestamp: { type: Date, default: Date.now }
});

const Traffic = mongoose.model("Traffic", TrafficSchema);

// API to Fetch Traffic Data from OpenRouteService and Save to DB
app.get("/api/traffic", async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ error: "Missing start or end coordinates" });
    }

    const response = await axios.get("https://api.openrouteservice.org/v2/directions/driving-car", {
      params: {
        api_key: process.env.ORS_API_KEY,
        start,
        end
      }
    });

    const routeData = response.data.routes[0].summary;

    const newTrafficData = new Traffic({
      start,
      end,
      distance: routeData.distance,
      duration: routeData.duration,
      trafficData: response.data
    });

    await newTrafficData.save();
    res.json(newTrafficData);

  } catch (error) {
    console.error("Error fetching traffic data:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// API to Retrieve Saved Traffic Data from DB
app.get("/api/history", async (req, res) => {
  try {
    const data = await Traffic.find().sort({ timestamp: -1 }).limit(10);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔹 AI Model API - Predict Traffic Volume
app.post("/api/predict", (req, res) => {
  const { hour, month, x, y } = req.body;

  if (hour === undefined || month === undefined || x === undefined || y === undefined) {
    return res.status(400).json({ error: "Missing input data for prediction" });
  }

  // Call Python script for AI prediction
  const pythonProcess = spawn("python", ["ml_model.py", hour, month, x, y]);

  pythonProcess.stdout.on("data", (data) => {
    const prediction = data.toString().trim();
    res.json({ predicted_traffic: prediction });
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`AI Model Error: ${data}`);
    res.status(500).json({ error: "Prediction failed" });
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

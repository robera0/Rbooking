import express from "express";
import { EventModel } from "./eventModel.js";
import multer from "multer";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

const eventrouter = express.Router();

//  Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

//  GET all events
eventrouter.get("/events", async (req, res) => {
  try {
    const eventdata = await EventModel.find();
    res.status(200).json(eventdata);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//  GET event by ID
eventrouter.get("/events/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid event ID format" });
    }

    const eventdata = await EventModel.findById(id);
    if (!eventdata) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(eventdata);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//  UPDATE event
eventrouter.put("/events/:id", upload.single("picture"), async (req, res) => {
  try {
    const eventId = req.params.id;
    const updatedData = {};

    if (req.body.name) updatedData.name = req.body.name;
    if (req.body.description) updatedData.description = req.body.description;
    if (req.body.duration) updatedData.duration = req.body.duration;
    if (req.body.price) updatedData.price = req.body.price;
    if (req.body.type) updatedData.type = req.body.type;
    if (req.body.location) updatedData.location = req.body.location;
    if (req.file) updatedData.picture = `/uploads/${req.file.filename}`;

    const updateEvent = await EventModel.findByIdAndUpdate(
      eventId,
      updatedData,
      { new: true }
    );

    if (!updateEvent) {
      return res
        .status(404)
        .json({ message: "Event not found or not updated" });
    }

    res.json({
      message: "Event updated successfully",
      Event: updateEvent,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE event

eventrouter.delete("/events/:id", async (req, res) => {
  try {
    const deletedId = req.params.id;
    const deletedEvent = await EventModel.findByIdAndDelete(deletedId);

    if (!deletedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res
      .status(200)
      .json({ message: "Event deleted successfully", deletedEvent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//  ADD new event
eventrouter.post("/events", upload.single("picture"), async (req, res) => {
  try {
    const {
      name,
      description,
      duration,
      price,
      age,
      location,
      start_time,
      end_time,
      type,
    } = req.body;

    const event = new EventModel({
      name,
      description,
      picture: req.file ? `/uploads/${req.file.filename}` : "",
      duration,
      price,
      age,
      location,
      start_time,
      end_time,
      type,
    });

    const savedEvent = await event.save();
    res.status(200).json(savedEvent);
  } catch (err) {
    if (req.file) {
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.error("Error deleting file:", unlinkErr);
      });
    }
    console.error("Error saving event:", err);
    res.status(500).json({ message: err.message });
  }
});

export default eventrouter;

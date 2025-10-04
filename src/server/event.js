import express from 'express'
import { EventModuel } from './eventModel.js'
import multer from "multer";
import fs from 'fs'
import path from "path";

const eventrouter = express.Router()
// get events
eventrouter.get('/events', async (req, res) => {
  try {
    const eventdata = await EventModuel.find()
    res.status(200).json(eventdata) 
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})
// add events 

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});

const upload = multer({ storage });

eventrouter.post('/events', upload.single('picture'), async (req, res) => {
  try {
    const { name, description, duration, price, age, start_time, end_time, header } = req.body;

    const event = new EventModuel({
      name,
      description,
      picture:req.file ? `/uploads/${req.file.filename}` : "",
      duration,
      price,
      age,
      start_time,
      end_time,
      header
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

export default eventrouter

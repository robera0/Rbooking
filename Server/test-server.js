import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import { ProfileModel } from "./models/profile.model.js";
import connectDB from "./config/databse.js";

const app = express();
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.put("/profile", upload.none(), async (req, res) => {
  try {
    await connectDB();
    const user_id = new mongoose.Types.ObjectId();
    const { fullName, Gender } = req.body;
    
    const updates = { fullName, Gender };
    
    const updatedProfile = await ProfileModel.findOneAndUpdate(
      { userId: user_id },
      updates,
      {
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
        upsert: true,
      }
    );
    res.json(updatedProfile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(5005, () => console.log("Test server running on 5005"));

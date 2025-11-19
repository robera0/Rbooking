import express from "express";
import { userModel } from "./userModel";

const userRouter = express.Router();
//SIGN IN ROUTES
userRouter.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await userModel.findOne({ username });
    if (existingUser)
      return res.status(400).json({ message: "Username already exists" });

    // NEW USER
    const newUser = new userModel({ username, password });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// LOGIN ROUTES
userRouter.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await userModel.findOne({ username });
    if (!user)
      return res.status(400).json({ message: "Invalid username or password" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid username or password" });

    res.status(200).json({ message: "Login successful" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

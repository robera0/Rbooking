import mongoose from "mongoose";
import connectDB from "./config/databse.js";
import { updateUser } from "./controllers/profile.controller.js";

async function run() {
  await connectDB();
  
  const req = {
    user: { id: "6a9b0b0c1cc383b08cf93151", role: "user" },
    body: {
      fullName: "Test UpdateUser",
      Gender: "male",
      phone: "" // empty phone like frontend sends
    },
    files: {}
  };
  
  const res = {
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      console.log(`Response [${this.statusCode}]:`, data);
    }
  };
  
  await new Promise((resolve) => {
    const next = (err) => {
      console.log("Next called with error:", err);
      resolve();
    };
    
    // Patch res.json to resolve the promise
    const originalJson = res.json;
    res.json = function(data) {
      originalJson.call(this, data);
      resolve();
    };
    
    updateUser(req, res, next);
  });
  
  process.exit(0);
}

run();

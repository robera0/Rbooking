import express from "express";
import { profileModel } from "./profileModel.js";
import multer from "multer";
import fs from "fs";
const profilerouter = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.\-]/g, "_");
    cb(null, timestamp + "-" + originalName);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// GET PROFILE INFOS
profilerouter.get("/profile", async (req, res) => {
  try {
    const profiledata = await profileModel.find();
    res.status(200).json(profiledata);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADD NEW PROFILE INFOS
profilerouter.post(
  "/profile",
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "logo", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const existingProfile = await profileModel.findOne({});
      if (existingProfile) {
        return res.status(400).json({ message: "Profile already exists." });
      }

      const profile_infos = new profileModel({
        name: req.body.name || "",
        description: req.body.description || "",
        cover: req.files?.cover ? req.files.cover[0].path : "",
        logo: req.files?.logo ? req.files.logo[0].path : "",
        info: [
          { info_type: "phone", value: req.body.phone || "" },
          { info_type: "instagram", value: req.body.instagram || "" },
          { info_type: "address", value: req.body.location || "" },
          { info_type: "email", value: req.body.email || "" },
          { info_type: "website", value: req.body.website || "" },
        ],
      });

      const savedprofile_infos = await profile_infos.save();
      res.status(200).json(savedprofile_infos);
    } catch (err) {
      if (req.files) {
        Object.values(req.files).forEach((fileArray) => {
          fileArray.forEach((file) => {
            fs.unlink(file.path, (unlinkErr) => {
              if (unlinkErr) console.error("Error deleting file:", unlinkErr);
            });
          });
        });
      }
      res.status(400).json({ message: err.message });
    }
  }
);

// UPDATE PROFILE
profilerouter.put(
  "/profile",
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "logo", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const existingProfile = await profileModel.findOne({});
      if (!existingProfile) {
        return res.status(404).json({ message: "Profile not found." });
      }

      const updatedData = {};
      const updatedInfo = existingProfile?.info
        ? [...existingProfile.info]
        : [];
      console.log(updatedData);
      const insertInfo = (infoType, value) => {
        const index = updatedInfo.findIndex(
          (i) => i.info_type.toLowerCase() === infoType.toLowerCase()
        );
        if (index > -1) {
          updatedInfo[index].value = value || updatedData.value;
        } else {
          updatedInfo.push({ info_type: infoType, value: value || "" });
        }
      };

      if (req.body.name) updatedData.name = req.body.name;
      if (req.body.description) updatedData.description = req.body.description;
      if (req.files?.logo) updatedData.logo = req.files.logo[0].path;
      if (req.files?.cover) updatedData.cover = req.files.cover[0].path;

      insertInfo("phone", req.body?.phone);
      insertInfo("instagram", req.body?.instagram);
      insertInfo("address", req.body?.location);
      insertInfo("email", req.body?.email);
      insertInfo("website", req.body?.website);
      console.log("the info values", req.body?.phone);
      updatedData.info = updatedInfo;

      const updatedProfile = await profileModel.findOneAndUpdate(
        {},
        updatedData,
        { new: true }
      );

      res.status(200).json({
        message: "Profile updated successfully",
        profile_info: updatedProfile,
      });
    } catch (err) {
      console.error("Error updating profile:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

export default profilerouter;

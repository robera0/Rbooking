import mongoose from "mongoose";

const infoSchema = new mongoose.Schema({
  info_type: { type: String, required: true },
  value: { type: String },
});
const profileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  cover: { type: String },
  logo: { type: String },
  info: [infoSchema],
});

export const profileModel = mongoose.model("profile_infos", profileSchema);

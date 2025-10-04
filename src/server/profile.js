import express from "express";
import { profileModel } from "./profileModel.js";
import multer from "multer";
import fs from 'fs'
const profilerouter = express.Router()

profilerouter.get('/profile',async(req,res)=>{
   
    //get profile infos
    try{
        const profiledata= await profileModel.find()
        res.status(200).json(profiledata)
    }
    catch(err){
        res.status(500).json({message:err.message})
    }
})

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
  
    const timestamp = Date.now();
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.\-]/g, '_');
    cb(null, timestamp + "-" + originalName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 
  },
  fileFilter: function (req, file, cb) {
   
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

profilerouter.post('/profile',  
  
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "logo", maxCount: 1 },
  ])
  , async (req, res) => {
  try {
const { name, description, phone, instagram, location, email, website } = req.body;


 const profile_infos = new profileModel({
        name,
        description,
        cover: req.files?.cover ? req.files.cover[0].path : "",
        logo: req.files?.logo ? req.files.logo[0].path : "",
        info: [{
            Phone: phone,
            Instagram: instagram,
            location:location,
            email:email,
            website:website
          }]

      });

    const savedprofile_infos = await profile_infos.save();
    res.status(200).json(savedprofile_infos);

  } catch (err) {

if (req.files) {
  Object.values(req.files).forEach(fileArray => {
    fileArray.forEach(file => {
      fs.unlink(file.path, (unlinkErr) => {
        if (unlinkErr) console.error("Error deleting file:", unlinkErr);
      });
    });
  });
}

    res.status(400).json({ message: err.message }); 
  }
});
export default  profilerouter
import express  from 'express'
import dotenv from "dotenv";
import mongoose from 'mongoose';
import eventrouter from './event.js';
import profilerouter from './profile.js';
import cors from "cors";
dotenv.config(); 
const PORT =  process.env.PORT || 5000
const MONGOURL =process.env.MONGO 
const app = express()
app.use(cors());
app.use(express.json())

app.use('/api',eventrouter)
app.use('/api',profilerouter)

mongoose.connect(MONGOURL).
then(()=>app.listen(PORT,()=>console.log(`server is connected on ${PORT}`)),
console.log("connected to the database"))

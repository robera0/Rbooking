import express from 'express'
import { EventModuel } from './eventModel.js'

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

export default eventrouter

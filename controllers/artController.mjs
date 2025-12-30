import express from 'express'
export const router = express.Router()
import "dotenv/config.js";

import { sendContactEmail } from '../services/emailService.mjs'



export const artController = {
  //finds all pieces in db
  findAll: async (req, res) => {
    let db = req.app.locals.db.db('sandycalhounv2').collection('arts')

    let query = {}
    let options = {
      sort: { year: -1, title: +1 }
    }
    const cursor = db.find(query, options)
    const data = await cursor.toArray()
    res.json(data)
  },
  //searches by title of piece
  findByTitle: async (req, res) => {
    let db = req.app.locals.db.db('sandycalhounv2').collection('arts')

    let query = { title: req.params.title }
    let options = {
      sort: { year: -1, title: +1 }
    }
    const cursor = db.find(query, options)
    const data = await cursor.toArray()
    res.json(data)
  },
  //searches by author
  findByAuthor: async (req, res) => {
    let db = req.app.locals.db.db('sandycalhounv2').collection('arts')

    let query = { author: req.params.author }
    let options = {
      sort: { year: -1, title: +1 }
    }
    const cursor = db.find(query, options)
    const data = await cursor.toArray()
    res.json(data)
  },
  //searches by year the piece was made
  findByYear: async (req, res) => {
    let db = req.app.locals.db.db('sandycalhounv2').collection('arts')

    let query = { year: req.params.year }
    let options = {
      sort: { year: -1, title: +1 }
    }
    const cursor = db.find(query, options)
    const data = await cursor.toArray()
    res.json(data)
  },
  //searches by media. Accepts up to 3 parameters, seperated by / . ie: */media/porcelain/underglaze/glaze
  //see index.js in routes for more details.
  findByMedia: async (req, res) => {
    let db = req.app.locals.db.db('sandycalhounv2').collection('arts')

    let query = { media: { $all: innerQ } }
    let innerQ = [
      ...req.params.media,
    ]
    if (req.params.mediatwo) {
      query.push(req.params.mediatwo)
    }
    if (req.params.mediathree) {
      query.push(req.params.mediathree)
    }
    let options = {
      sort: { year: -1, title: +1 }
    }
    const cursor = db.find(query, options)
    const data = await cursor.toArray()
    res.json(data)

  },
  sendMessage: async (req, res) => {
    try {
      // Validate required fields
      const { name, email, subject, message } = req.body

      if (!name || !email || !subject || !message) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'All fields (name, email, subject, message) are required',
        })
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Invalid email format',
        })
      }

      // Sanitize input - basic length checks
      if (name.length > 100) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Name must be 100 characters or less',
        })
      }

      if (subject.length > 200) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Subject must be 200 characters or less',
        })
      }

      if (message.length > 5000) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Message must be 5000 characters or less',
        })
      }

      // Send email using email service
      const result = await sendContactEmail({ name, email, subject, message })

      // Log successful send (without sensitive data)
      console.log('Contact form email sent successfully:', {
        messageId: result.MessageId,
        to: email,
        timestamp: new Date().toISOString(),
      })

      res.status(200).json({
        success: true,
        messageId: result.MessageId,
        message: 'Email sent successfully',
      })
    } catch (error) {
      console.error('Error in sendMessage controller:', error)

      // Return appropriate error response
      if (error.message.includes('Validation failed') || error.message.includes('Invalid')) {
        return res.status(400).json({
          error: 'Validation failed',
          message: error.message,
        })
      }

      // Server error
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to send email. Please try again later.',
      })
    }
  }
}

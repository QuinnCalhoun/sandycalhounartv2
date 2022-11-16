import express from 'express'
export const router = express.Router()

export const showController = {
  getShows: async (req, res) => {
    let db = req.app.locals.db.db('sandycalhounv2').collection('shows')

    let query = {}
    let options = {
      sort: { year: -1, title: +1 }
    }
    const cursor = db.find(query, options)
    const data = await cursor.toArray()
    res.json(data)
  }
}
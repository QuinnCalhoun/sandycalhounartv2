import express from 'express'
export const router = express.Router()

export const showController = {
  getShows: async (req, res) => {
    let db = req.app.locals.db.db('sandycalhounv2').collection('shows')

    const today = new Date()
    today.setHours(0, 0, 0, 0) // Set to start of day for comparison

    // Resume shows: all shows that are NOT currently upcoming
    // Includes: regular resume entries AND shows that have passed their end date
    // This way shows automatically appear in resume once they end
    let query = {
      $or: [
        { isUpcoming: { $ne: true } },
        { isUpcoming: { $exists: false } },
        { 
          isUpcoming: true,
          endDate: { $lt: today } // Shows that have passed their end date
        }
      ]
    }
    let options = {
      sort: { year: -1, title: +1 }
    }
    const cursor = db.find(query, options)
    const data = await cursor.toArray()
    
    // Transform data: if a show has endDate but no year, derive year from endDate
    const transformedData = data.map(show => {
      if (!show.year && show.endDate) {
        const endDate = new Date(show.endDate)
        return { ...show, year: endDate.getFullYear() }
      }
      return show
    })
    
    // Re-sort after transformation (in case year was added)
    transformedData.sort((a, b) => {
      const yearA = a.year || 0
      const yearB = b.year || 0
      if (yearB !== yearA) return yearB - yearA
      return (a.title || '').localeCompare(b.title || '')
    })
    
    res.json(transformedData)
  },
  getUpcomingShows: async (req, res) => {
    let db = req.app.locals.db.db('sandycalhounv2').collection('shows')

    const today = new Date()
    today.setHours(0, 0, 0, 0) // Set to start of day for comparison

    let query = {
      isUpcoming: true,
      endDate: { $gte: today }
    }
    let options = {
      sort: { startDate: 1, title: 1 } // Sort by start date, earliest first
    }
    const cursor = db.find(query, options)
    const data = await cursor.toArray()
    res.json(data)
  }
}
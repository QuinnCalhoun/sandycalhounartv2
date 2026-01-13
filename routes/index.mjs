import express from 'express'
export const router = express.Router()
import rateLimit from 'express-rate-limit'
import {artController} from '../controllers/artController.mjs'
import {showController} from '../controllers/showController.mjs'

// Rate limiting for contact form - 5 requests per 15 minutes per IP
const contactRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'Too many contact form submissions from this IP, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

router.route('/api/art')
    .get(artController.findAll)

router.route('/api/art/title/:title')
    .get(artController.findByTitle)

router.route('/api/art/author/:author')
    .get(artController.findByAuthor)

router.route('/api/art/year/:year')
    .get(artController.findByYear)

// Handle media routes with 1, 2, or 3 parameters
// Express 5.x doesn't support optional parameters with ?, so we need separate routes
router.route('/api/art/media/:media')
    .get(artController.findByMedia)
router.route('/api/art/media/:media/:mediatwo')
    .get(artController.findByMedia)
router.route('/api/art/media/:media/:mediatwo/:mediathree')
    .get(artController.findByMedia)

router.route('/api/shows')
    .get(showController.getShows)
router.route('/api/shows/upcoming')
    .get(showController.getUpcomingShows)
router.route('/api/contact')
    .post(contactRateLimiter, artController.sendMessage)

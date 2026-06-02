import express from 'express'
export const router = express.Router()
import rateLimit from 'express-rate-limit'
import {artController} from '../controllers/artController.mjs'
import {showController} from '../controllers/showController.mjs'
import {adminController} from '../controllers/adminController.mjs'
import {requireAuth} from '../services/authMiddleware.mjs'

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

// Rate limiting for admin login - 10 attempts per 15 minutes per IP
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    error: 'Too many requests',
    message: 'Too many login attempts from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
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

// ===== Admin routes =====
router.route('/api/admin/login')
    .post(loginRateLimiter, adminController.login)

router.route('/api/admin/upload-url')
    .post(requireAuth, adminController.getUploadUrl)

router.route('/api/admin/art')
    .get(requireAuth, adminController.listArt)
    .post(requireAuth, adminController.createArt)
router.route('/api/admin/art/:id')
    .put(requireAuth, adminController.updateArt)
    .delete(requireAuth, adminController.deleteArt)
router.route('/api/admin/art/:id/restore')
    .put(requireAuth, adminController.restoreArt)

router.route('/api/admin/shows')
    .get(requireAuth, adminController.listShows)
    .post(requireAuth, adminController.createShow)
router.route('/api/admin/shows/:id')
    .put(requireAuth, adminController.updateShow)
    .delete(requireAuth, adminController.deleteShow)

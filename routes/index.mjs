import express from 'express'
export const router = express.Router()
import {artController} from '../controllers/artController.mjs'
import {showController} from '../controllers/showController.mjs'

router.route('/api/art')
    .get(artController.findAll)

router.route('/api/art/title/:title')
    .get(artController.findByTitle)

router.route('/api/art/author/:author')
    .get(artController.findByAuthor)

router.route('/api/art/year/:year')
    .get(artController.findByYear)

// ? indicates optional parameters. The parameter with no question mark after it is the default if the user only inputs one value.
router.route('/api/art/media/:media/:mediatwo?/:mediathree?')
    .get(artController.findByMedia)

router.route('/api/shows')
    .get(showController.getShows)
router.route('/api/contact')
    .post(artController.sendMessage)

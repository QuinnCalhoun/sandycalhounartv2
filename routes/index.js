const router = require('express').Router()
const artController = require('../controllers/artController')
const showController = require('../controllers/showController')

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

// ? indicates optional parameters. The parameter with no question mark after it is the default if the user only inputs one value.
router.route('/api/art/size/:width?/:height/:length?')
    .get(artController.findBySize)

router.route('/api/art/price/:price')
    .get(artController.findByPrice)

router.route('/api/art/type/:type')
    .get(artController.findByPieceType)

router.route('/api/art/image/:imageUrl')
    .get(artController.findByImageUrl)

router.route('/api/art/shows/:show')
    .get(artController.findByShow)

router.route('/api/shows')
    .get(showController.getShows)
router.route('/api/contact')
    .post(artController.sendMessage)

module.exports = router
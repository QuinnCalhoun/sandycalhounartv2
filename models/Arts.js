const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ArtSchema = new Schema({
    imageUrl: { type: Array, required: [true, 'Must have photo url'] },
    srcSet: {type: Object, required: [true, 'the performance, dog']},
    title: { type: String, required: [true, 'Must input a title'] },
    author: { type: String, required: [true, 'Please input an author'] },
    year: { type: Number, required: [true, 'Please input year made'] },
    media: { type: Array, required: [true, 'Please input media type'] },
    size: { type: Object, required: false },
    price: { type: Number, },
    shows: { type: Array },
    wallPiece: { type: Boolean, default: false }
})

const Arts = mongoose.model('Arts', ArtSchema)

module.exports = Arts
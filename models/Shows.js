const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ShowSchema = new Schema({
    awards: {type: Array,},
    title: { type: String, required: [true, 'Must input a title'] },
    location: { type: String, required: [true, 'Must input a location'] },
    juror: { type: String, },
    year: { type: Number, required: [true, 'Please input year of show'] },
    soloShow: { type: Boolean,},
})

const Shows = mongoose.model('Shows', ShowSchema)

module.exports = Shows
import "dotenv/config.js";
import { MongoClient } from 'mongodb'
import { showSeed } from '../seeds/showSeed.mjs'
const uri = process.env.MONGODB_URI

console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })


const run = async () => {
  try {
    await client.connect()

    const db = client.db('sandycalhounv2')
    db.collection('shows').drop()
    await db.createCollection('shows', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: [
            'title',
            'location',
            'year',
          ],
          properties: {
            title: {
              bsonType: 'string',
              description: 'Must input a title'
            },
            year: {
              bsonType: 'number',
              description: 'Must have a created on year'
            },
            juror: {
              bsonType: 'string',
            },
            location: {
              bsonType: 'string',
            },
            awards: {
              bsonType: 'array',
            },
            soloShow: {
              bsonType: 'bool',
            }
          }
        }
      }
    })
    await db.collection('shows').insertMany(showSeed)
  } catch (err) {
    console.log(err)
  } finally {
    await client.close()
  }
}

run()

// const ArtSchema = new Schema({
//   imageUrl: { type: Array, required: [true, 'Must have photo url'] },
//   srcSet: { type: Object, required: [true, 'the performance, dog'] },
//   title: { type: String, required: [true, 'Must input a title'] },
//   author: { type: String, required: [true, 'Please input an author'] },
//   year: { type: Number, required: [true, 'Please input year made'] },
//   media: { type: Array, required: [true, 'Please input media type'] },
//   size: { type: Object, required: false },
//   price: { type: Number, },
//   shows: { type: Array },
//   wallPiece: { type: Boolean, default: false }
// })

// const Arts = mongoose.model('Arts', ArtSchema)

// module.exports = Arts


///////////


// const mongoose = require('mongoose')
// const Schema = mongoose.Schema

// const ShowSchema = new Schema({
//   awards: { type: Array, },
//   title: { type: String, required: [true, 'Must input a title'] },
//   location: { type: String, required: [true, 'Must input a location'] },
//   juror: { type: String, },
//   year: { type: Number, required: [true, 'Please input year of show'] },
//   soloShow: { type: Boolean, },
// })

// const Shows = mongoose.model('Shows', ShowSchema)

// module.exports = Shows
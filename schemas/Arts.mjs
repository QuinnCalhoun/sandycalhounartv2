import "dotenv/config.js";

import { MongoClient } from 'mongodb'
import { artSeed } from '../seeds/seedDB.mjs'
const uri = process.env.MONGODB_URI

console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })


const run = async () => {
  try {
    await client.connect()
    const db = client.db('sandycalhounv2')
    db.collection('arts').drop()
    await db.createCollection('arts', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: [
            'imageUrl',
            'title',
            'author',
            'year',
            'media',
            'size'],
          properties: {
            imageUrl: {
              bsonType: 'string',
              description: 'Must have photo url'
            },
            title: {
              bsonType: 'string',
              description: 'Must input a title'
            },
            author: {
              bsonType: 'string',
              description: 'Please input an author'
            },
            year: {
              bsonType: 'number',
              description: 'Must have a created on year'
            },
            media: {
              bsonType: 'array',
              description: 'Please input media type'
            },
            size: {
              bsonType: 'object',
            },
            price: {
              bsonType: 'number',
            },
            shows: {
              bsonType: 'array',
            },
            wallPiece: {
              bsonType: 'bool',
            }
          }
        }
      }
    })
    await db.collection('arts').insertMany(artSeed)
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
import express from 'express'
export const router = express.Router()
import "dotenv/config.js";

import AWS from 'aws-sdk'



export const artController = {
  //finds all pieces in db
  findAll: async (req, res) => {
    let db = req.app.locals.db.db('sandycalhounv2').collection('arts')

    let query = {}
    let options = {
      sort: { year: -1, title: +1 }
    }
    const cursor = db.find(query, options)
    const data = await cursor.toArray()
    res.json(data)
  },
  //searches by title of piece
  findByTitle: async (req, res) => {
    let db = req.app.locals.db.db('sandycalhounv2').collection('arts')

    let query = { title: req.params.title }
    let options = {
      sort: { year: -1, title: +1 }
    }
    const cursor = db.find(query, options)
    const data = await cursor.toArray()
    res.json(data)
  },
  //searches by author
  findByAuthor: async (req, res) => {
    let db = req.app.locals.db.db('sandycalhounv2').collection('arts')

    let query = { author: req.params.author }
    let options = {
      sort: { year: -1, title: +1 }
    }
    const cursor = db.find(query, options)
    const data = await cursor.toArray()
    res.json(data)
  },
  //searches by year the piece was made
  findByYear: async (req, res) => {
    let db = req.app.locals.db.db('sandycalhounv2').collection('arts')

    let query = { year: req.params.year }
    let options = {
      sort: { year: -1, title: +1 }
    }
    const cursor = db.find(query, options)
    const data = await cursor.toArray()
    res.json(data)
  },
  //searches by media. Accepts up to 3 parameters, seperated by / . ie: */media/porcelain/underglaze/glaze
  //see index.js in routes for more details.
  findByMedia: async (req, res) => {
    let db = req.app.locals.db.db('sandycalhounv2').collection('arts')

    let query = { media: { $all: innerQ } }
    let innerQ = [
      ...req.params.media,
    ]
    if (req.params.mediatwo) {
      query.push(req.params.mediatwo)
    }
    if (req.params.mediathree) {
      query.push(req.params.mediathree)
    }
    let options = {
      sort: { year: -1, title: +1 }
    }
    const cursor = db.find(query, options)
    const data = await cursor.toArray()
    res.json(data)

  },
  sendMessage: async (req, res) => {
    AWS.config.update({region: 'us-west-2'});

    let params = {
      Destination: { /* required */
        CcAddresses: [
          'quinn.tcalhoun@gmail.com',
          /* more items */
        ],
        ToAddresses: [
          'sandycalhounart@gmail.com',
          /* more items */
        ]
      },
      Message: { /* required */
        Body: { /* required */
          Text: {
           Charset: "UTF-8",
           Data: `Hello, ${req.body.name} at ${req.body.email} has sent the following message: \n
           ${req.body.message}`
          }
         },
         Subject: {
          Charset: 'UTF-8',
          Data: req.body.subject
         }
        },
      Source: 'sandy@sandycalhoun.com', /* required */
    };
    
    // Create the promise and SES service object
    const sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();
    
    // Handle promise's fulfilled/rejected states
    sendPromise.then(
      function(data) {
        res.send(data.MessageId);
      }).catch(
        function(err) {
        console.error(err, err.stack);
      });

  }
}

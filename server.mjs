import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
import bodyParser from 'body-parser'
import { MongoClient } from 'mongodb'

import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
const app = express();
const PORT = process.env.PORT || 3001;

// Define middleware here
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Serve up static assets (usually on heroku)
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

import { router as routes } from "./routes/index.mjs"
// Add routes, both API and view

app.use(express.static(path.join(__dirname, '/client/build')));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '/client/build', 'index.html'));
});
app.use(routes);

MongoClient.connect(process.env.MONGODB_URI, (err, db) => {
  if (err) {
    console.log('Failed to connect to database. ' + err.stack)
  }
  console.log('We have a database connection at ' + db.options.dbName)
  app.locals.db = db
  app.listen(PORT, () => {
    console.log(`API listening on port ${PORT}`)
  })
})



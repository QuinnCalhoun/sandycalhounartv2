import express from 'express'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
import cors from 'cors'
import bodyParser from 'body-parser'
import { MongoClient } from 'mongodb'
import { router as routes } from "./routes/index.mjs"

import dotenv from 'dotenv'
dotenv.config()

const app = express();
const PORT = process.env.PORT || 3001;

// Define middleware here
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
const corsOptions = {
  origin: (origin, callback) => {
    callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Access-Control-Allow-Origin", "Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
  credentials: true
};
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

// Serve up static assets (usually on heroku)
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}
// Add routes, both API and view
app.use(routes);

app.use(express.static(path.join(__dirname, '/client/build')));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '/client/build', 'index.html'));
});

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



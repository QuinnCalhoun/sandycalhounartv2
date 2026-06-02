import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
import { MongoClient } from 'mongodb'

import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
const app = express();
const PORT = process.env.PORT || 3001;

// Define middleware here
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// Serve up static assets (usually on heroku)
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

import { router as routes } from "./routes/index.mjs"
// Add routes, both API and view

app.use(express.static(join(__dirname, '/client/build')));

app.get('/', function (req, res) {
  res.sendFile(join(__dirname, '/client/build', 'index.html'));
});
app.use(routes);

// Check if MONGODB_URI is set
if (!process.env.MONGODB_URI) {
  console.error('ERROR: MONGODB_URI environment variable is not set!')
  console.error('Please create a .env file with your MongoDB connection string.')
  console.error('Example: MONGODB_URI=mongodb://localhost:27017/your-database')
  process.exit(1)
}

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    const client = new MongoClient(process.env.MONGODB_URI)
    await client.connect()
    const db = client.db('sandycalhounv2')
    console.log('Successfully connected to database: ' + db.databaseName)
    app.locals.db = client // Store the client, not just the db
    app.locals.dbName = 'sandycalhounv2'
    
    app.listen(PORT, () => {
      console.log(`API listening on port ${PORT}`)
    })
  } catch (err) {
    console.error('Failed to connect to database:', err.message)
    console.error('Server will not start without database connection.')
    process.exit(1)
  }
}

startServer()



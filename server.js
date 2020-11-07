const express = require("express");
const path = require('path')
const nodemailer = require('nodemailer');
const cors = require('cors')
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient
const uri = process.env.MONGODB_URI
const client = new MongoClient(uri, { useNewUrlParser: true });
const routes = require("./routes");
const app = express();
const PORT = process.env.PORT || 3001;
require('dotenv').config()

// Define middleware here
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: "*", // <-- location of the react app were connecting to
    credentials: true,
    
  })
)
// Serve up static assets (usually on heroku)
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}
// Add routes, both API and view
app.use(routes);

app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, './client/build/index.html'), function(err) {
    if (err) {
      res.status(500).send(err)
    }
  })
})

// Connect to the Mongo DB
client.connect(err => {
  if (err) throw err
  console.log('connected')
})

// Start the API server
app.listen(PORT, function() {
  console.log(`🌎  ==> API Server now listening on PORT ${PORT}!`);
});


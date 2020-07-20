const mongoose = require('mongoose')
const db = require('../models')

mongoose.connect(
  process.env.MONGODB_URI ||
  'mongodb://localhost/sandycalhoundb'
)

const showSeed = [
    {
        title: 'Dysfunctional Figures',
        location: 'Pence Gallery, Davis, Ca',
        year: 2017,
    },
    {
        title: '666 Small Works Ceramic Exhibition',
        location: 'Applied Contemporary, Oakland, Ca',
        year: 2020,
        juror: 'Didem Mert',
    },
    {
        title: 'San Angelo National Ceramic Competition',
        location: 'San Angelo Museum of Fine Arts, San Angelo, Texas',
        year: 2020,
        juror: 'Jo Lauria',
    },
    {
        title: 'Figure it Out',
        location: 'Healdsburg Art Center, Healdsburg, Ca',
        year: 2020,
    },
    {
        title: 'Beyond the Brickyard',
        location: 'Archie Bray Foundation, Helena, Mt',
        year: 2020,
        juror: 'Chris Staley',
    },
    {
        title: 'California State Fair',
        location: 'Cal Expo, Sacramento, Ca',
        year: 2019,
    },
    {
        title: 'California Clay Competition',
        location: 'The Artery, Davis, Ca',
        year: 2019,
        juror: 'Bill Albright',
    },
    {
        title: 'Artists from Alpha',
        location: 'Sparrow Gallery, Sacramento, Ca',
        year: 2019,
    },
    {
        title: 'Off-Center',
        location: 'Blue Line Arts, Roseville, Ca',
        year: 2019,
        juror: 'Joshua Green',
    },
    {
        title: 'Crocker-Kingsley',
        location: 'Blue Line Arts, Roseville, Ca',
        year: 2019,
        juror: 'David Pagel',
    },
    {
        title: 'Sandy Calhoun, Suzanne Long, and Colleen Sidey: Ceramic Figures',
        location: 'Epperson Gallery, Crockett, Ca',
        year: 2018,
    },
    {
        title: 'Artists from Alpha',
        location: 'Sparrow Gallery, Sacramento, Ca',
        year: 2018,
        juror: '',
    },
    {
        title: 'California Clay Competition',
        location: 'The Artery, Davis, Ca',
        year: 2018,
        juror: 'Michelle Gregor',
    },
    {
        title: 'Eccentric Imagery',
        location: 'Blue Line Arts, Roseville, Ca',
        year: 2017,
    },
    {
        title: 'Plate and Totem Show',
        location: 'Blue Line Arts, Roseville, Ca',
        year: 2016,
    },
    {
        title: 'Bust Show',
        location: 'Sparrow Gallery, Sacramento, Ca',
        year: 2016,
    },
    {
        title: 'Slice: A Juried Cross-Section of Regional Art',
        location: 'Pence Gallery, Davis, Ca',
        year: 2015,
    },
    {
        title: 'Transmigrational Ceramics from the Corridor',
        location: '621 Gallery, Benicia, Ca',
        year: 2015,
    },
    {
        title: 'America\'s Clayfest II',
        location: 'Blue Line Arts, Roseville, Ca',
        year: 2014,
    },
    {
        title: 'Plate and Totem Show',
        location: 'Blue Line Arts, Roseville, Ca',
        year: 2013,
    },
]

db.Shows
  .deleteMany({})
  .then(() => db.Shows.collection.insertMany(showSeed))
  .then(data => {
    console.log(data.result.n + " records inserted!");
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

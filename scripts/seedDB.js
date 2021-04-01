const mongoose = require('mongoose')
const db = require('../models')

mongoose.connect(
  process.env.MONGODB_URI ||
  'mongodb://localhost/sandycalhoundb'
)

const artSeed = [
  {
    imageUrl: 'https://i.ibb.co/0fp8Ry9/Word-Keeper-opt.jpg',
    title: 'It must be Monday',
    author: 'Sandy Calhoun',
    year: 2017,
    media: ['porcelain', 'high-fire glaze', 'underglaze'],
    size: {width: 9.5, height: 8, length: 6.5},
    price: 500.00,
    shows: ['test show'],
    wallPiece: true,
  },
  {
    imageUrl: 'https://i.ibb.co/kcX9Kwm/Mama-Sputnick-opt.jpg',
    title: 'Mama Sputnik',
    author: 'Sandy Calhoun',
    year: 2017,
    media: ['porcelain', 'Low-fire Glaze'],
    size: {width: 17, height: 14.5, length: 5.5},
    price: 500,
    shows: [],
    wallPiece: true,
  },
  {
    imageUrl: 'https://i.ibb.co/tb6fWDH/The-truth-was-beginning-to-sink-in-opt.jpg',
    title: 'Reality was beginning to sink in',
    author: 'Sandy Calhoun',
    year: 2016,
    media: ['porcelain', 'high-fire glaze', 'underglaze'],
    size: {width: 6, height: 18, length: 4.5},
    shows: [],
    wallPiece: true,
  },
  {
    imageUrl: 'https://i.ibb.co/j3JdLkx/Too-Big-For-Britches-opt.jpg',
    title: 'Oh, yeah',
    author: 'Sandy Calhoun',
    year: 2016,
    media: ['porcelain', 'underglaze'],
    size: {width: 6,height: 19,length: 6.5},
    price: 500,
    shows: [],
    wallPiece: false,
  },
  {
    imageUrl: 'https://i.ibb.co/HPyCmgR/innerchild-opt.jpg',
    title: 'His inner child was becoming a burden',
    author: 'Sandy Calhoun',
    year: 2018,
    media: ['high-fire clay', 'underglaze', 'high-fire glaze', 'low-fire glaze'],
    size: {width: 19, height: 21, length: 24},
    price: 700,
    shows: [],
    wallPiece: false,
  },
  {
    imageUrl: 'https://i.ibb.co/Y23Kzq4/Open-Wide-opt.jpg',
    title: 'Uncle Chester likes his cherries',
    author: 'Sandy Calhoun',
    year: 2017,
    media: ['porcelain', 'underglaze', 'glaze'],
    size: {width: 13, height: 11, length: 7},
    shows: [],
    wallPiece: false
  },
  {
    imageUrl: 'https://i.ibb.co/7gFb3kp/beveryquiet-opt.jpg',
    title: 'Be verwy, verwy, quiet...',
    author: 'Sandy Calhoun',
    year: 2018,
    media: ['high-fire clay', 'glaze', 'underglaze'],
    size: {width: 19.5, height: 6.5, length: 8},
    shows: [],
    wallPiece: true,
  },
  {
    imageUrl: 'https://i.ibb.co/dP2LTXN/Needy-Inner-Child-opt.jpg',
    title: 'I have a needy inner child',
    author: 'Sandy Calhoun',
    year: 2017,
    media: ['high-fire clay', 'underglaze', 'glaze'],
    size: {width: 17.5, height: 15.5, length: 8},
    shows: [],
    wallPiece: true,
  },
  {
    imageUrl: 'https://i.ibb.co/3mXHVS8/inner-Princess-opt.jpg',
    title: 'Searching for her inner princess',
    author: 'Sandy Calhoun',
    year: 2018,
    media: ['porcelain', 'underglaze', 'glaze'],
    size: {width: 15.5, height: 9, length: 11.5},
    price: 800,
    shows: [],
    wallPiece: false
  },
  {
    imageUrl: 'https://i.ibb.co/ZBQXSXW/Getawaywithbaggage-opt.jpg',
    title: 'Getaway, with baggage',
    author: 'Sandy Calhoun',
    year: 2018,
    media: ['high-fire clay', 'underglaze', 'glaze'],
    size: {width: 14, height: 22, length: 10.5},
    price: 800,
    shows: [],
    wallPiece: false
  },
  {
    imageUrl: 'https://i.ibb.co/2yn2dtg/Day-She-Could-Not-Fly-opt.jpg',
    title: 'The day she learned she couldn\'t fly',
    author: 'Sandy Calhoun',
    year: 2019,
    media: ['high-fire clay', 'underglaze', 'glaze'],
    size: {width: 16, height: 20, length: 13.5},
    shows: [],
    wallPiece: true,
  },
  {
    imageUrl: 'https://i.ibb.co/Px7QSpN/Didntlikewherethiswasheaded-opt.jpg',
    title: 'He didn\'t like where this was going',
    author: 'Sandy Calhoun',
    year: 2017,
    media: ['porcelain', 'underglaze', 'glaze'],
    size: {width: 10, height: 16, length: 10},
    shows: [],
    wallPiece: true,
  },
  {
    imageUrl: 'https://i.ibb.co/5941QmN/More-Dangerous-opt.jpg',
    title: 'More dangerous than she appears',
    author: 'Sandy Calhoun',
    year: 2018,
    media: ['high-fire clay', 'underglaze', 'glaze'],
    size: {width: 13, height: 18, length: 9},
    shows: [],
    wallPiece: true,
    price: 750
  },
  {
    imageUrl: 'https://i.ibb.co/9Y0PQNQ/Naturalpeoplepleaser-opt.jpg',
    title: 'Natural born people-pleaser',
    author: 'Sandy Calhoun',
    year: 2019,
    media: ['high-fire clay', 'underglaze', 'glaze'],
    size: {width: 27, height: 6, length: 10},
    shows: [],
    wallPiece: false,
  },
  {
    imageUrl: 'https://i.ibb.co/HBDxxj9/Waiting-For-Sign-opt.jpg',
    title: 'Waiting for a sign',
    author: 'Sandy Calhoun',
    year: 2019,
    media: ['high-fire clay', 'underglaze', 'glaze'],
    size: {width: 'unknown', height: 'unknown', length: 'unknown'},
    shows: [],
    wallPiece: true,
    price: 740
  },
  {
    imageUrl: 'https://i.ibb.co/jJrcB0K/Crybaby-opt.jpg',
    title: 'Crybaby',
    author: 'Sandy Calhoun',
    year: 2018,
    media: ['high-fire clay', 'underglaze', 'glaze'],
    size: {width: 21, height: 15, length: 8},
    shows: [],
    wallPiece: false,
  },
  {
    imageUrl: 'https://i.ibb.co/XCQTdGt/She-Was-BEginning-opt.jpg',
    title: 'She was beginning to wonder...',
    author: 'Sandy Calhoun',
    year: 2016,
    media: ['high-fire clay', 'underglaze', 'glaze'],
    size: {width: 15, height: 15, length: 6},
    shows: [],
    wallPiece: false,
  },
  {
    imageUrl: 'https://i.ibb.co/CwrsDw8/Unresolved-Issues-opt.jpg',
    title: 'She was beginning to think he had unresolved issues',
    author: 'Sandy Calhoun',
    year: 2014,
    media: ['high-fire clay', 'underglaze', 'glaze'],
    size: {width: 15, height: 21, length: 7},
    shows: [],
    wallPiece: false,
  },
  {
    imageUrl: 'https://i.ibb.co/3f35vrx/holdingon-opt.jpg',
    title: 'They said it would be easy',
    author: 'Sandy Calhoun',
    year: 2017,
    media: ['high-fire clay', 'underglaze', 'glaze'],
    size: {width: 23, height: 20, length: 7},
    shows: [],
    wallPiece: true,
  },
  {
    imageUrl: 'https://i.ibb.co/9pq4xZW/Lullaby-opt.jpg',
    title: 'Lullabye',
    author: 'Sandy Calhoun',
    year: 2016,
    media: ['high-fire clay', 'underglaze', 'glaze'],
    size: {width: 14, height: 10, length: 9},
    shows: [],
    wallPiece: false,
  },
  {
    imageUrl: 'https://i.ibb.co/XCGHTRr/She-Was-ANatural-opt.jpg',
    title: 'She was a natural',
    author: 'Sandy Calhoun',
    year: 2017,
    media: ['porcelain', 'underglaze', 'glaze'],
    size: {width: 16, height: 16, length: 4},
    shows: [],
    wallPiece: true,
  },
  {
    imageUrl: 'https://i.ibb.co/3y52gr2/Subtly-Game-Weak-opt.jpg',
    title: 'Subtlety wasn\'t her strong suit',
    author: 'Sandy Calhoun',
    year: 2015,
    media: ['high-fire clay', 'underglaze', 'glaze'],
    size: {width: 24, height: 19, length: 10},
    shows: [],
    wallPiece: false,
  },
  {
    imageUrl: 'https://i.ibb.co/h8hrdZG/ps-image-opt.jpg',
    title: 'Anne',
    author: 'Sandy Calhoun',
    year: 2019,
    media: ['high-fire clay', 'underglaze', 'glaze'],
    size: {width: 19, height: 7, length: 4},
    shows: [],
    wallPiece: true,
  },
  {
    imageUrl: 'https://i.ibb.co/SX4srG5/One-Trick-Pony1-opt.jpg',
    title: 'His birthday suit was wearing thin',
    author: 'Sandy Calhoun',
    year: 2019,
    media: ['high-fire clay', 'underglaze', 'glaze'],
    size: {width: 17, height: 6, length: 8},
    shows: [],
    wallPiece: false,
    price: 500
  },
  {
    imageUrl: 'https://i.ibb.co/k3h82hV/Bathtime1-opt.jpg',
    title: 'Bathtime',
    author: 'Sandy Calhoun',
    year: 2019,
    media: ['high-fire clay', 'underglaze', 'glaze', 'metal wheels'],
    size: {width: 22, height: 16, length: 16},
    shows: [],
    wallPiece: false,
    price: 700
  },
  {
    imageUrl: 'https://i.ibb.co/vVGt3yp/Lookout-opt.jpg',
    title: 'Look-out',
    author: 'Sandy Calhoun',
    year: 2019,
    media: ['high-fire clay', 'underglaze', 'glaze'],
    size: {width: 17, height: 10, length: 9},
    shows: [],
    wallPiece: false,
  },
  {
    imageUrl: 'https://i.ibb.co/93X17tc/Babybird2-opt.jpg',
    title: 'Baby bird',
    author: 'Sandy Calhoun',
    year: 2019,
    media: ['high-fire clay', 'underglaze', 'glaze'],
    size: {width: 23, height: 9, length: 11},
    shows: [],
    wallPiece: false,
    price: 1200
  },
  {
    imageUrl: 'https://i.ibb.co/hyjJfwY/lifeontheedge-opt.jpg',
    title: 'Living her life on the edge',
    author: 'Sandy Calhoun',
    year: 2016,
    media: ['high-fire clay', 'underglaze', 'glaze'],
    size: {width: 9, height: 6, length: 6},
    shows: [],
    wallPiece: true,
  },
  {
    imageUrl: 'https://i.ibb.co/XDHBD9t/Knewhewas-opt.jpg',
    title: 'He just knew he was something else',
    author: 'Sandy Calhoun',
    year: 2015,
    media: ['high-fire clay', 'underglaze', 'glaze'],
    size: {width: 25.5, height: 9, length: 7.5},
    shows: [],
    wallPiece: false,
  },
  {
    imageUrl: 'https://i.ibb.co/VSNRGzy/Copy-of-Blue-2.jpg',
    title: 'Blue',
    author: 'Sandy Calhoun',
    year: 2020,
    media: ['cone 5 clay', 'underglaze', 'glaze'],
    size: {width: 17, height: 19, length: 20},
    shows: [],
    wallPiece: false,
    price: 1500
  },
  {
    imageUrl: 'https://i.ibb.co/6P1Xr91/Copy-of-Yes-sir-yes-sir-1.jpg',
    title: 'Yes sir, Yes sir',
    author: 'Sandy Calhoun',
    year: 2020,
    media: ['cone 5 clay', 'underglaze', 'glaze', 'oxide'],
    size: {width: 17, height: 14, length: 20},
    shows: [],
    wallPiece: false,
    price: 1500
  },
  {
    imageUrl: 'https://i.ibb.co/SckGcRt/Copy-of-Leveret.jpg',
    title: 'Leveret',
    author: 'Sandy Calhoun',
    year: 2020,
    media: ['cone 5 clay', 'underglaze', 'glaze'],
    size: {width: 26, height: 16, length: 9},
    shows: [],
    wallPiece: false,
    price: 1000
  },
]

db.Arts
  .deleteMany({})
  .then(() => db.Arts.collection.insertMany(artSeed))
  .then(data => {
    console.log(data.result.n + " records inserted!");
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

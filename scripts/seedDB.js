const mongoose = require('mongoose')
const db = require('../models')

mongoose.connect(
  process.env.MONGODB_URI ||
  'mongodb://localhost/sandycalhoundb'
)

const artSeed = [
  {
    imageUrl: ['https://i.ibb.co/3rWSRvV/Word-Keeper.jpg'],
    srcSet: {
      w200: 'https://i.ibb.co/1qw1Zf1/Word-Keeper-pit3wb-c-scale-w-200.jpg',
      w740: 'https://i.ibb.co/nn3Bxtj/Word-Keeper-pit3wb-c-scale-w-487.jpg',
      w983: 'https://i.ibb.co/z2DnHkx/Word-Keeper-pit3wb-c-scale-w-857.jpg',
      w1182: 'https://i.ibb.co/1KqsXzN/Word-Keeper-pit3wb-c-scale-w-1110.jpg',
      w1323: 'https://i.ibb.co/9vXgyVM/Word-Keeper-pit3wb-c-scale-w-1320.jpg',
      w1400: 'https://i.ibb.co/6wJb1FG/Word-Keeper-pit3wb-c-scale-w-1400.jpg'
    },
    title: 'It must be Monday',
    author: 'Sandy Calhoun',
    year: 2017,
    media: ['porcelain', 'high-fire glaze', 'underglaze'],
    size: { width: 9.5, height: 8, length: 6.5 },
    price: 500.00,
    shows: ['test show'],
    wallPiece: true,
  },
  {
    imageUrl: ['https://i.ibb.co/xJcjJ0H/Mama-Sputnick.jpg'],
    srcSet: {
      w200: 'https://i.ibb.co/8YTmt1n/Mama-Sputnick-sg8ki4-c-scale-w-200.jpg',
      w740: 'https://i.ibb.co/hsxL72K/Mama-Sputnick-sg8ki4-c-scale-w-702.jpg',
      w983: 'https://i.ibb.co/cyS14Pb/Mama-Sputnick-sg8ki4-c-scale-w-969.jpg',
      w1182: 'https://i.ibb.co/2SSdFHQ/Mama-Sputnick-sg8ki4-c-scale-w-1193.jpg',
      w1323: 'https://i.ibb.co/xqX8W2J/Mama-Sputnick-sg8ki4-c-scale-w-1291.jpg',
      w1400: 'https://i.ibb.co/gDF8tyg/Mama-Sputnick-sg8ki4-c-scale-w-1400.jpg'
    },
    title: 'Mama Sputnik',
    author: 'Sandy Calhoun',
    year: 2017,
    media: ['porcelain', 'Low-fire Glaze'],
    size: { width: 17, height: 14.5, length: 5.5 },
    price: 500,
    shows: [],
    wallPiece: true,
  },
  {
    imageUrl: ['https://i.ibb.co/K7Lp278/The-truth-was-beginning-to-sink-in.jpg'],
    srcSet: {
      w200: 'https://i.ibb.co/WFnJRjT/The-truth-was-beginning-to-sink-in-ehlb29-c-scale-w-200.jpg',
      w740: 'https://i.ibb.co/K7nQb4V/The-truth-was-beginning-to-sink-in-ehlb29-c-scale-w-720.jpg',
      w983: 'https://i.ibb.co/jybNC2D/The-truth-was-beginning-to-sink-in-ehlb29-c-scale-w-889.jpg',
      w1182: 'https://i.ibb.co/5Mds2dY/The-truth-was-beginning-to-sink-in-ehlb29-c-scale-w-1171.jpg',
      w1323: 'https://i.ibb.co/CVN8QDp/The-truth-was-beginning-to-sink-in-ehlb29-c-scale-w-1295.jpg',
      w1400: 'https://i.ibb.co/xDLVb4v/The-truth-was-beginning-to-sink-in-ehlb29-c-scale-w-1400.jpg'
    },
    title: 'Reality was beginning to sink in',
    author: 'Sandy Calhoun',
    year: 2016,
    media: ['porcelain', 'high-fire glaze', 'underglaze'],
    size: { width: 6, height: 18, length: 4.5 },
    shows: [],
    wallPiece: true,
  },
  {
    imageUrl: ['https://i.ibb.co/N3LtJ0K/Too-Big-For-Britches.jpg'],
    srcSet: {
      w200: 'https://i.ibb.co/Pm8HRgf/Too-Big-For-Britches-bmqtga-c-scale-w-200.jpg',
      w740: 'https://i.ibb.co/WvhLdWn/Too-Big-For-Britches-bmqtga-c-scale-w-694.jpg',
      w983: 'https://i.ibb.co/86rd8Cx/Too-Big-For-Britches-bmqtga-c-scale-w-993.jpg',
      w1182: 'https://i.ibb.co/bJCQ6Wv/Too-Big-For-Britches-bmqtga-c-scale-w-1112.jpg',
      w1323: 'https://i.ibb.co/zX01ZZZ/Too-Big-For-Britches-bmqtga-c-scale-w-1345.jpg',
      w1400: 'https://i.ibb.co/6ytMmJ1/Too-Big-For-Britches-bmqtga-c-scale-w-1400.jpg'
    },
    title: 'Oh, yeah',
    author: 'Sandy Calhoun',
    year: 2016,
    media: ['porcelain', 'underglaze'],
    size: { width: 6, height: 19, length: 6.5 },
    price: 500,
    shows: [],
    wallPiece: false,
  },
  {
    imageUrl: ['https://i.ibb.co/mh2GJqK/innerchild.jpg'],
    srcSet: {
      w200: 'https://i.ibb.co/mDgHrwX/innerchild-blehx2-c-scale-w-200.jpg',
      w740: 'https://i.ibb.co/bKXybGP/innerchild-blehx2-c-scale-w-661.jpg',
      w983: 'https://i.ibb.co/wcgR3kf/innerchild-blehx2-c-scale-w-966.jpg',
      w1182: 'https://i.ibb.co/KwqyTMR/innerchild-blehx2-c-scale-w-1098.jpg',
      w1323: 'https://i.ibb.co/T4X3t0s/innerchild-blehx2-c-scale-w-1336.jpg',
      w1400: 'https://i.ibb.co/R6Tg6zS/innerchild-blehx2-c-scale-w-1400.jpg'
    },
    title: 'His inner child was becoming a burden',
    author: 'Sandy Calhoun',
    year: 2018,
    media: ['high-fire clay', 'underglaze', 'high-fire glaze', 'low-fire glaze'],
    size: { width: 19, height: 21, length: 24 },
    price: 700,
    shows: [],
    wallPiece: false,
  },
  {
    imageUrl: ['https://i.ibb.co/K9gHvwP/OpenWide.jpg'],
    srcSet: {
      w200: 'https://i.ibb.co/gzHzNHr/Open-Wide-vwpu2b-c-scale-w-200.jpg',
      w740: 'https://i.ibb.co/v3QcGQB/Open-Wide-vwpu2b-c-scale-w-755.jpg',
      w983: 'https://i.ibb.co/YPCb8Tw/Open-Wide-vwpu2b-c-scale-w-947.jpg',
      w1182: 'https://i.ibb.co/4g51VzC/Open-Wide-vwpu2b-c-scale-w-1117.jpg',
      w1323: 'https://i.ibb.co/2YrjHgs/Open-Wide-vwpu2b-c-scale-w-1374.jpg',
      w1400: 'https://i.ibb.co/44x2VkQ/Open-Wide-vwpu2b-c-scale-w-1400.jpg'
    },
    title: 'Uncle Chester likes his cherries',
    author: 'Sandy Calhoun',
    year: 2017,
    media: ['porcelain', 'underglaze', 'glaze'],
    size: { width: 13, height: 11, length: 7 },
    shows: [],
    wallPiece: false
  },
  {
    imageUrl: ['https://i.ibb.co/kV7fkWG/beveryquiet.jpg'],
    srcSet: {
      w200: 'https://i.ibb.co/2d4nDM0/beveryquiet-lqn6lo-c-scale-w-200.jpg',
      w740: 'https://i.ibb.co/CnLNFBS/beveryquiet-lqn6lo-c-scale-w-384.jpg',
      w983: '',
      w1182: '',
      w1323: '',
      w1400: ''
    },
    title: 'Be verwy, verwy, quiet...',
    author: 'Sandy Calhoun',
    year: 2018,
    media: ['high-fire clay', 'glaze', 'underglaze'],
    size: { width: 19.5, height: 6.5, length: 8 },
    shows: [],
    wallPiece: true,
  },
  {
    imageUrl: ['https://i.ibb.co/YNqWVcP/Needy-Inner-Child.jpg'],
    srcSet: {
      w200: 'https://i.ibb.co/2WP2FfQ/Needy-Inner-Child-prxr2v-c-scale-w-200.jpg',
      w740: 'https://i.ibb.co/gTHTR7D/Needy-Inner-Child-prxr2v-c-scale-w-384.jpg',
      w983: '',
      w1182: '',
      w1323: '',
      w1400: ''
    },
    title: 'I have a needy inner child',
    author: 'Sandy Calhoun',
    year: 2017,
    media: ['high-fire clay', 'underglaze', 'glaze'],
    size: { width: 17.5, height: 15.5, length: 8 },
    shows: [],
    wallPiece: true,
  },
  {
    imageUrl: ['https://i.ibb.co/tP27f2y/Princess-test-fail-1.jpg'],
    srcSet: {
      w200: 'https://i.ibb.co/zVw3zgH/inner-Princess-mtkyay-c-scale-w-200.jpg',
      w740: 'https://i.ibb.co/bbpvfYw/inner-Princess-mtkyay-c-scale-w-672.jpg',
      w983: 'https://i.ibb.co/JmsPF6z/inner-Princess-mtkyay-c-scale-w-967.jpg',
      w1182: 'https://i.ibb.co/2FcQKVx/inner-Princess-mtkyay-c-scale-w-1215.jpg',
      w1323: 'https://i.ibb.co/T8X69yJ/inner-Princess-mtkyay-c-scale-w-1331.jpg',
      w1400: 'https://i.ibb.co/fr75Rh7/inner-Princess-mtkyay-c-scale-w-1400.jpg'
    },
    title: 'Searching for her inner princess',
    author: 'Sandy Calhoun',
    year: 2018,
    media: ['porcelain', 'underglaze', 'glaze'],
    size: { width: 15.5, height: 9, length: 11.5 },
    price: 800,
    shows: [],
    wallPiece: false
  },
  {
    imageUrl: ['https://i.ibb.co/2hLhX5D/Getawaywithbaggage.jpg'],
    srcSet: {
      w200: 'https://i.ibb.co/4Frz4D5/Getawaywithbaggage-tpi4xh-c-scale-w-200.jpg',
      w740: 'https://i.ibb.co/sPP9hX1/Getawaywithbaggage-tpi4xh-c-scale-w-665.jpg',
      w983: 'https://i.ibb.co/Bj6C6p2/Getawaywithbaggage-tpi4xh-c-scale-w-982.jpg',
      w1182: 'https://i.ibb.co/Q66QXy8/Getawaywithbaggage-tpi4xh-c-scale-w-1189.jpg',
      w1323: 'https://i.ibb.co/khjdPTg/Getawaywithbaggage-tpi4xh-c-scale-w-1370.jpg',
      w1400: 'https://i.ibb.co/ZdrcDMP/Getawaywithbaggage-tpi4xh-c-scale-w-1400.jpg'
    },
    title: 'Getaway, with baggage',
    author: 'Sandy Calhoun',
    year: 2018,
    media: ['high-fire clay', 'underglaze', 'glaze'],
    size: { width: 14, height: 22, length: 10.5 },
    price: 800,
    shows: [],
    wallPiece: false
  },
  {
    imageUrl: ['https://i.ibb.co/R2PJmn3/Day-She-Could-Not-Fly.jpg'],
    srcSet: {
      w200: 'https://i.ibb.co/Ks6TDyX/Day-She-Could-Not-Fly-t1bq1z-c-scale-w-200.jpg',
      w740: 'https://i.ibb.co/jyR5gs7/Day-She-Could-Not-Fly-t1bq1z-c-scale-w-574.jpg',
      w983: 'https://i.ibb.co/DC7f4kv/Day-She-Could-Not-Fly-t1bq1z-c-scale-w-960.jpg',
      w1182: '',
      w1323: '',
      w1400: ''
    },
    title: 'The day she learned she couldn\'t fly',
    author: 'Sandy Calhoun',
    year: 2019,
    media: ['high-fire clay', 'underglaze', 'glaze'],
    size: { width: 16, height: 20, length: 13.5 },
    shows: [],
    wallPiece: true,
  },
  {
    imageUrl: ['https://i.ibb.co/LS01ty1/Didntlikewherethiswasheaded.jpg'],
    srcSet: {
      w200: 'https://i.ibb.co/yQkz3d1/Didntlikewherethiswasheaded-eongxc-c-scale-w-200.jpg',
      w740: 'https://i.ibb.co/3N0sRS6/Didntlikewherethiswasheaded-eongxc-c-scale-w-639.jpg',
      w983: 'https://i.ibb.co/9YXKg1R/Didntlikewherethiswasheaded-eongxc-c-scale-w-919.jpg',
      w1182: 'https://i.ibb.co/9cdhzJX/Didntlikewherethiswasheaded-eongxc-c-scale-w-1152.jpg',
      w1323: 'https://i.ibb.co/PTx9Wjv/Didntlikewherethiswasheaded-eongxc-c-scale-w-1379.jpg',
      w1400: 'https://i.ibb.co/xDrZY7b/Didntlikewherethiswasheaded-eongxc-c-scale-w-1400.jpg'
    },
    title: 'He didn\'t like where this was going',
    author: 'Sandy Calhoun',
    year: 2017,
    media: ['porcelain', 'underglaze', 'glaze'],
    size: { width: 10, height: 16, length: 10 },
    shows: [],
    wallPiece: true,
  },
  {
    imageUrl: ['https://i.ibb.co/swsgMRj/More-Dangerous.jpg'],
    srcSet: {
      w200: 'https://i.ibb.co/0fjT3WN/More-Dangerous-wyxwaw-c-scale-w-200.jpg',
      w740: 'https://i.ibb.co/0qv8DYJ/More-Dangerous-wyxwaw-c-scale-w-655.jpg',
      w983: 'https://i.ibb.co/Yccpg38/More-Dangerous-wyxwaw-c-scale-w-952.jpg',
      w1182: 'https://i.ibb.co/pXRysFV/More-Dangerous-wyxwaw-c-scale-w-1164.jpg',
      w1323: 'https://i.ibb.co/f9k4Pdx/More-Dangerous-wyxwaw-c-scale-w-1340.jpg',
      w1400: 'https://i.ibb.co/THTX7DV/More-Dangerous-wyxwaw-c-scale-w-1400.jpg'
    },
    title: 'More dangerous than she appears',
    author: 'Sandy Calhoun',
    year: 2018,
    media: ['high-fire clay', 'underglaze', 'glaze'],
    size: { width: 13, height: 18, length: 9 },
    shows: [],
    wallPiece: true,
    price: 750
  },
  {
    imageUrl: ['https://i.ibb.co/gPFS23j/Naturalpeoplepleaser.jpg'],
    srcSet: {
      w200: 'https://i.ibb.co/SyfqxNv/Naturalpeoplepleaser-dejf7e-c-scale-w-200.jpg',
      w740: 'https://i.ibb.co/gtv7WpJ/Naturalpeoplepleaser-dejf7e-c-scale-w-740.jpg',
      w983: 'https://i.ibb.co/Jp8kRMd/Naturalpeoplepleaser-dejf7e-c-scale-w-995.jpg',
      w1182: 'https://i.ibb.co/drzhtNk/Naturalpeoplepleaser-dejf7e-c-scale-w-1199.jpg',
      w1323: 'https://i.ibb.co/0My0512/Naturalpeoplepleaser-dejf7e-c-scale-w-1357.jpg',
      w1400: 'https://i.ibb.co/r7QHdG5/Naturalpeoplepleaser-dejf7e-c-scale-w-1400.jpg'
    },
    title: 'Natural born people-pleaser',
    author: 'Sandy Calhoun',
    year: 2019,
    media: ['high-fire clay', 'underglaze', 'glaze'],
    size: { width: 27, height: 6, length: 10 },
    shows: [],
    wallPiece: false,
    price: 800
  },
  {
    imageUrl: ['https://i.ibb.co/TR2fZ10/Waiting-For-Sign.jpg'],
    srcSet: {
      w200: 'https://i.ibb.co/GVQg7tG/Waiting-For-Sign-yqwg4h-c-scale-w-200.jpg',
      w740: 'https://i.ibb.co/M6RCJQ8/Waiting-For-Sign-yqwg4h-c-scale-w-703.jpg',
      w983: 'https://i.ibb.co/tzYPwQb/Waiting-For-Sign-yqwg4h-c-scale-w-971.jpg',
      w1182: 'https://i.ibb.co/tPnYznx/Waiting-For-Sign-yqwg4h-c-scale-w-1186.jpg',
      w1323: 'https://i.ibb.co/NFwFfGc/Waiting-For-Sign-yqwg4h-c-scale-w-1289.jpg',
      w1400: 'https://i.ibb.co/HBpMg7c/Waiting-For-Sign-yqwg4h-c-scale-w-1400.jpg'
    },
    title: 'Waiting for a sign',
    author: 'Sandy Calhoun',
    year: 2019,
    media: ['high-fire clay', 'underglaze', 'glaze'],
    size: { width: 'unknown', height: 'unknown', length: 'unknown' },
    shows: [],
    wallPiece: true,
    price: 740
  },
  {
    imageUrl: ['https://i.ibb.co/njvrj6D/Crybaby.jpg'],
    srcSet: {
      w200: 'https://i.ibb.co/sw4JnHp/Crybaby-dwcl8u-c-scale-w-200.jpg',
      w740: 'https://i.ibb.co/x7DX56r/Crybaby-dwcl8u-c-scale-w-673.jpg',
      w983: 'https://i.ibb.co/St5twLT/Crybaby-dwcl8u-c-scale-w-948.jpg',
      w1182: 'https://i.ibb.co/bBDpNC6/Crybaby-dwcl8u-c-scale-w-1177.jpg',
      w1323: 'https://i.ibb.co/41Pz3kX/Crybaby-dwcl8u-c-scale-w-1280.jpg',
      w1400: 'https://i.ibb.co/VWKzppB/Crybaby-dwcl8u-c-scale-w-1400.jpg'
    },
    title: 'Crybaby',
    author: 'Sandy Calhoun',
    year: 2018,
    media: ['high-fire clay', 'underglaze', 'glaze'],
    size: { width: 21, height: 15, length: 8 },
    shows: [],
    wallPiece: false,
  },
  {
    imageUrl: ['https://i.ibb.co/tzrJsyn/She-Was-BEginning.jpg'],
    srcSet: {
      w200: 'https://i.ibb.co/4Tpf1bp/She-Was-BEginning-spgvyn-c-scale-w-200.jpg',
      w740: 'https://i.ibb.co/h1SY4HG/She-Was-BEginning-spgvyn-c-scale-w-781.jpg',
      w983: 'https://i.ibb.co/9WVH8jJ/She-Was-BEginning-spgvyn-c-scale-w-911.jpg',
      w1182: 'https://i.ibb.co/TKdXMPw/She-Was-BEginning-spgvyn-c-scale-w-1144.jpg',
      w1323: 'https://i.ibb.co/wMDBktw/She-Was-BEginning-spgvyn-c-scale-w-1250.jpg',
      w1400: 'https://i.ibb.co/X7C67By/She-Was-BEginning-spgvyn-c-scale-w-1400.jpg'
    },
    title: 'She was beginning to wonder...',
    author: 'Sandy Calhoun',
    year: 2016,
    media: ['high-fire clay', 'underglaze', 'glaze'],
    size: { width: 15, height: 15, length: 6 },
    shows: [],
    wallPiece: false,
  },
  {
    imageUrl: ['https://i.ibb.co/0tzSfsx/Unresolved-Issues.jpg'],
    srcSet: {
      w200: 'https://i.ibb.co/QMcVS65/Unresolved-Issues-l8uhir-c-scale-w-200.jpg',
      w740: 'https://i.ibb.co/xH7tv7L/Unresolved-Issues-l8uhir-c-scale-w-753.jpg',
      w983: 'https://i.ibb.co/Ptz72jw/Unresolved-Issues-l8uhir-c-scale-w-815.jpg',
      w1182: '',
      w1323: '',
      w1400: ''
    },
    title: 'She was beginning to think he had unresolved issues',
    author: 'Sandy Calhoun',
    year: 2014,
    media: ['high-fire clay', 'underglaze', 'glaze'],
    size: { width: 15, height: 21, length: 7 },
    shows: [],
    wallPiece: false,
  },
  {
    imageUrl: ['https://i.ibb.co/6ZMR3H0/holdingon.jpg'],
    srcSet: {
      w200: 'https://i.ibb.co/gRxLyCB/holdingon-akwil5-c-scale-w-200.jpg',
      w740: 'https://i.ibb.co/jMyN9kN/holdingon-akwil5-c-scale-w-653.jpg',
      w983: 'https://i.ibb.co/fFTPXX9/holdingon-akwil5-c-scale-w-925.jpg',
      w1182: 'https://i.ibb.co/1XrgdQb/holdingon-akwil5-c-scale-w-1153.jpg',
      w1323: 'https://i.ibb.co/qrJRWy6/holdingon-akwil5-c-scale-w-1264.jpg',
      w1400: 'https://i.ibb.co/MhVyqSG/holdingon-akwil5-c-scale-w-1400.jpg'
    },
    title: 'They said it would be easy',
    author: 'Sandy Calhoun',
    year: 2017,
    media: ['high-fire clay', 'underglaze', 'glaze'],
    size: { width: 23, height: 20, length: 7 },
    shows: [],
    wallPiece: true,
  },
  {
    imageUrl: ['https://i.ibb.co/dctP27V/Lullaby.jpg'],
    srcSet: {
      w200: 'https://i.ibb.co/0Zdj374/Lullaby-uucrje-c-scale-w-200.jpg',
      w740: 'https://i.ibb.co/G9FYpXH/Lullaby-uucrje-c-scale-w-684.jpg',
      w983: 'https://i.ibb.co/DKBkzfr/Lullaby-uucrje-c-scale-w-990.jpg',
      w1182: 'https://i.ibb.co/nbGMBxY/Lullaby-uucrje-c-scale-w-1131.jpg',
      w1323: 'https://i.ibb.co/Yj9FYGV/Lullaby-uucrje-c-scale-w-1251.jpg',
      w1400: 'https://i.ibb.co/5k4FBy9/Lullaby-uucrje-c-scale-w-1400.jpg'
    },
    title: 'Lullabye',
    author: 'Sandy Calhoun',
    year: 2016,
    media: ['high-fire clay', 'underglaze', 'glaze'],
    size: { width: 14, height: 10, length: 9 },
    shows: [],
    wallPiece: false,
  },
  {
    imageUrl: ['https://i.ibb.co/MZLWT5j/She-Was-ANatural.jpg'],
    srcSet: {
      w200: 'https://i.ibb.co/M5c5G1G/She-Was-ANatural-i7qdvw-c-scale-w-200.jpg',
      w740: 'https://i.ibb.co/QpZ2dbr/She-Was-ANatural-i7qdvw-c-scale-w-781.jpg',
      w983: 'https://i.ibb.co/7pQNwYD/She-Was-ANatural-i7qdvw-c-scale-w-901.jpg',
      w1182: 'https://i.ibb.co/R49fnj4/She-Was-ANatural-i7qdvw-c-scale-w-1147.jpg',
      w1323: 'https://i.ibb.co/0r5cQFC/She-Was-ANatural-i7qdvw-c-scale-w-1260.jpg',
      w1400: 'https://i.ibb.co/FW0wBnF/She-Was-ANatural-i7qdvw-c-scale-w-1400.jpg'
    },
    title: 'She was a natural',
    author: 'Sandy Calhoun',
    year: 2017,
    media: ['porcelain', 'underglaze', 'glaze'],
    size: { width: 16, height: 16, length: 4 },
    shows: [],
    wallPiece: true,
  },
  {
    imageUrl: ['https://i.ibb.co/M71ww46/Subtly-Game-Weak.jpg'],
    srcSet: {
      w200: 'https://i.ibb.co/cgGT1h3/Subtly-Game-Weak-cpdpzz-c-scale-w-200.jpg',
      w740: 'https://i.ibb.co/9pm743k/Subtly-Game-Weak-cpdpzz-c-scale-w-578.jpg',
      w983: '',
      w1182: '',
      w1323: '',
      w1400: ''
    },
    title: 'Subtlety wasn\'t her strong suit',
    author: 'Sandy Calhoun',
    year: 2015,
    media: ['high-fire clay', 'underglaze', 'glaze'],
    size: { width: 24, height: 19, length: 10 },
    shows: [],
    wallPiece: false,
  },
  {
    imageUrl: ['https://i.ibb.co/xFh3YqR/ps-image.jpg'],
    srcSet: {
      w200: 'https://i.ibb.co/FJ3x35J/ps-image-vawuxi-c-scale-w-200.jpg',
      w740: 'https://i.ibb.co/ZGrs7kL/ps-image-vawuxi-c-scale-w-698.jpg',
      w983: 'https://i.ibb.co/fnKv60w/ps-image-vawuxi-c-scale-w-968.jpg',
      w1182: 'https://i.ibb.co/sJPcksV/ps-image-vawuxi-c-scale-w-1083.jpg',
      w1323: 'https://i.ibb.co/ftPZZ1m/ps-image-vawuxi-c-scale-w-1283.jpg',
      w1400: 'https://i.ibb.co/JncLGjn/ps-image-vawuxi-c-scale-w-1400.jpg'
    },
    title: 'Anne',
    author: 'Sandy Calhoun',
    year: 2019,
    media: ['high-fire clay', 'underglaze', 'glaze'],
    size: { width: 19, height: 7, length: 4 },
    shows: [],
    wallPiece: true,
    price: 500
  },
  {
    imageUrl: ['https://i.ibb.co/vhgHjJ3/One-Trick-Pony1.jpg'],
    srcSet: {
      w200: 'https://i.ibb.co/J25r4cq/One-Trick-Pony1-ly08q8-c-scale-w-200.jpg',
      w740: 'https://i.ibb.co/wJ4YRMd/One-Trick-Pony1-ly08q8-c-scale-w-764.jpg',
      w983: 'https://i.ibb.co/ns76Md6/One-Trick-Pony1-ly08q8-c-scale-w-914.jpg',
      w1182: 'https://i.ibb.co/Pxhnj27/One-Trick-Pony1-ly08q8-c-scale-w-1043.jpg',
      w1323: 'https://i.ibb.co/GTvvgpG/One-Trick-Pony1-ly08q8-c-scale-w-1264.jpg',
      w1400: 'https://i.ibb.co/ZSQHqcD/One-Trick-Pony1-ly08q8-c-scale-w-1400.jpg'
    },
    title: 'His birthday suit was wearing thin',
    author: 'Sandy Calhoun',
    year: 2019,
    media: ['high-fire clay', 'underglaze', 'glaze'],
    size: { width: 17, height: 6, length: 8 },
    shows: [],
    wallPiece: false,
    price: 500
  },
  {
    imageUrl: ['https://i.ibb.co/Fn0xCsR/Bathtime1.jpg'],
    srcSet: {
      w200: 'https://i.ibb.co/x5Zbrmg/Bathtime1-xqxsp0-c-scale-w-200.jpg',
      w740: '',
      w983: 'https://i.ibb.co/5Ky7Sqq/Bathtime1-xqxsp0-c-scale-w-854.jpg',
      w1182: 'https://i.ibb.co/dK2DvXd/Bathtime1-xqxsp0-c-scale-w-1164.jpg',
      w1323: '',
      w1400: 'https://i.ibb.co/TK6JdzF/Bathtime1-xqxsp0-c-scale-w-1400.jpg'
    },
    title: 'Bathtime',
    author: 'Sandy Calhoun',
    year: 2019,
    media: ['high-fire clay', 'underglaze', 'glaze', 'metal wheels'],
    size: { width: 22, height: 16, length: 16 },
    shows: [],
    wallPiece: false,
    price: 700
  },
  {
    imageUrl: ['https://i.ibb.co/dP5mC7h/Lookout.jpg'],
    srcSet: {
      w200: 'https://i.ibb.co/SJxFxc9/Lookout-ddyfqf-c-scale-w-200.jpg',
      w740: '',
      w983: 'https://i.ibb.co/QNwF8LH/Lookout-ddyfqf-c-scale-w-812.jpg',
      w1182: 'https://i.ibb.co/zF0vkzn/Lookout-ddyfqf-c-scale-w-1068.jpg',
      w1323: 'https://i.ibb.co/Y0yNWQx/Lookout-ddyfqf-c-scale-w-1291.jpg',
      w1400: 'https://i.ibb.co/frYBKJc/Lookout-ddyfqf-c-scale-w-1400.jpg'
    },
    title: 'Look-out',
    author: 'Sandy Calhoun',
    year: 2019,
    media: ['high-fire clay', 'underglaze', 'glaze'],
    size: { width: 17, height: 10, length: 9 },
    shows: [],
    wallPiece: false,
    price: 800
  },
  {
    imageUrl: ['https://i.ibb.co/5vvnB0P/Babybird0.jpg'],
    srcSet: {
      w200: 'https://i.ibb.co/WgyyTZg/Babybird0w-200.jpg',
      w740: 'https://i.ibb.co/3vSJgSD/Babybird0w-740.jpg',
      w983: 'https://i.ibb.co/sKrjc7L/Babybird0w-983.jpg',
      w1182: 'https://i.ibb.co/zsnQ59v/Babybird0w-1182.jpg',
      w1323: 'https://i.ibb.co/gPr81G4/Babybird0w-1323.jpg',
      w1400: 'https://i.ibb.co/CMTCx88/Babybird0w-1400.jpg'
    },
    title: 'Baby bird',
    author: 'Sandy Calhoun',
    year: 2019,
    media: ['high-fire clay', 'underglaze', 'glaze'],
    size: { width: 23, height: 9, length: 11 },
    shows: [],
    wallPiece: false,
    price: 1200
  },
  {
    imageUrl: ['https://i.ibb.co/HzRVQ0K/Copy-of-Living-her-life-on-the-edge.jpg'],
    srcSet: {
      w200: 'https://i.ibb.co/2PGn8L8/lifeontheedge-cslwnt-c-scale-w-200.jpg',
      w740: 'https://i.ibb.co/QjgfCkN/lifeontheedge-cslwnt-c-scale-w-753.jpg',
      w983: 'https://i.ibb.co/WcJrYmS/lifeontheedge-cslwnt-c-scale-w-933.jpg',
      w1182: 'https://i.ibb.co/b6PQSjn/lifeontheedge-cslwnt-c-scale-w-1087.jpg',
      w1323: 'https://i.ibb.co/phbfbXr/lifeontheedge-cslwnt-c-scale-w-1221.jpg',
      w1400: 'https://i.ibb.co/jb95R8V/lifeontheedge-cslwnt-c-scale-w-1400.jpg'
    },
    title: 'Living her life on the edge',
    author: 'Sandy Calhoun',
    year: 2016,
    media: ['high-fire clay', 'underglaze', 'glaze'],
    size: { width: 9, height: 6, length: 6 },
    shows: [],
    wallPiece: true,
  },
  {
    imageUrl: ['https://i.ibb.co/hgt37nq/Knewhewas.jpg'],
    srcSet: {
      w200: 'https://i.ibb.co/rGdnxCy/Knewhewas-e3f8nu-c-scale-w-200.jpg',
      w740: 'https://i.ibb.co/WyJ5FF7/Knewhewas-e3f8nu-c-scale-w-295.jpg',
      w983: '',
      w1182: '',
      w1323: '',
      w1400: ''
    },
    title: 'He just knew he was something else',
    author: 'Sandy Calhoun',
    year: 2015,
    media: ['high-fire clay', 'underglaze', 'glaze'],
    size: { width: 25.5, height: 9, length: 7.5 },
    shows: [],
    wallPiece: false,
  },
  {
    imageUrl: ['https://i.ibb.co/VSNRGzy/Copy-of-Blue-2.jpg'],
    srcSet: {
      w200: 'https://i.ibb.co/Z61LXYG/Copy-of-Blue-2-gunqj2-c-scale-w-200.jpg',
      w740: 'https://i.ibb.co/jwFRnKy/Copy-of-Blue-2-gunqj2-c-scale-w-859.jpg',
      w983: 'https://i.ibb.co/d46Gh7n/Copy-of-Blue-2-gunqj2-c-scale-w-1040.jpg',
      w1182: 'https://i.ibb.co/mBW5Wcr/Copy-of-Blue-2-gunqj2-c-scale-w-1198.jpg',
      w1323: 'https://i.ibb.co/NnfMwsf/Copy-of-Blue-2-gunqj2-c-scale-w-1332.jpg',
      w1400: 'https://i.ibb.co/9cXcKbs/Copy-of-Blue-2-gunqj2-c-scale-w-1400.jpg'
    },
    title: 'Blue',
    author: 'Sandy Calhoun',
    year: 2020,
    media: ['cone 5 clay', 'underglaze', 'glaze'],
    size: { width: 17, height: 19, length: 20 },
    shows: [],
    wallPiece: false,
    price: 1500
  },
  {
    imageUrl: ['https://i.ibb.co/6P1Xr91/Copy-of-Yes-sir-yes-sir-1.jpg'],
    srcSet: {
      w200: 'https://i.ibb.co/888Q2C5/Copy-of-Yes-sir-yes-sir-1-okwlog-c-scale-w-200.jpg',
      w740: 'https://i.ibb.co/j3N17Hs/Copy-of-Yes-sir-yes-sir-1-okwlog-c-scale-w-590.jpg',
      w983: 'https://i.ibb.co/dQ7jSML/Copy-of-Yes-sir-yes-sir-1-okwlog-c-scale-w-845.jpg',
      w1182: 'https://i.ibb.co/vkPVzMQ/Copy-of-Yes-sir-yes-sir-1-okwlog-c-scale-w-1021.jpg',
      w1323: 'https://i.ibb.co/0FQt4Mc/Copy-of-Yes-sir-yes-sir-1-okwlog-c-scale-w-1193.jpg',
      w1400: 'https://i.ibb.co/RhL8v4N/Copy-of-Yes-sir-yes-sir-1-okwlog-c-scale-w-1400.jpg'
    },
    title: 'Yes sir, Yes sir',
    author: 'Sandy Calhoun',
    year: 2020,
    media: ['cone 5 clay', 'underglaze', 'glaze', 'oxide'],
    size: { width: 17, height: 14, length: 20 },
    shows: [],
    wallPiece: false,
    price: 1500
  },
  {
    imageUrl: ['https://i.ibb.co/SckGcRt/Copy-of-Leveret.jpg'],
    srcSet: {
      w200: 'https://i.ibb.co/KrhWjjr/Copy-of-Leveret-fvhjvy-c-scale-w-200.jpg',
      w740: 'https://i.ibb.co/HpV9r4z/Copy-of-Leveret-fvhjvy-c-scale-w-625.jpg',
      w983: 'https://i.ibb.co/GFygh67/Copy-of-Leveret-fvhjvy-c-scale-w-896.jpg',
      w1182: 'https://i.ibb.co/nkkNZVg/Copy-of-Leveret-fvhjvy-c-scale-w-1078.jpg',
      w1323: 'https://i.ibb.co/vXQFCV7/Copy-of-Leveret-fvhjvy-c-scale-w-1257.jpg',
      w1400: 'https://i.ibb.co/sJZ6VCn/Copy-of-Leveret-fvhjvy-c-scale-w-1400.jpg'
    },
    title: 'Leveret',
    author: 'Sandy Calhoun',
    year: 2020,
    media: ['cone 5 clay', 'underglaze', 'glaze'],
    size: { width: 26, height: 16, length: 9 },
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

const db = require('../models')
const nodemailer = require('nodemailer')
const smtpTransport = require('nodemailer-smtp-transport')

require('dotenv').config()


const creds = {
    USER: process.env.USER,
    PASS: process.env.PASS
}

module.exports = {
    //finds all pieces in db
    findAll: function (req, res) {
        db.Arts.find({})
            .sort({ year: -1 })
            .sort({ title: +1 })
            .then((dbModel) => res.json(dbModel))
            .catch((err) => res.status(422).json(err));
    },
    //searches by title of piece
    findByTitle: function (req, res) {
        console.log(req.params)
        db.Arts.findOne({ title: req.params.title })
            .then((art) => res.json(art))
            .catch((err) => res.status(422).json(err));
    },
    //searches by author
    findByAuthor: function (req, res) {
        db.Arts.find({ author: req.params.author })
            .sort({ title: +1 })
            .then(art => res.json(art))
            .catch((err) => res.status(422).json(err));
    },
    //searches by year the piece was made
    findByYear: function (req, res) {
        db.Arts.find({ year: req.params.year })
            .sort({ title: +1 })
            .then(art => res.json(art))
            .catch((err) => res.status(422).json(err));
    },
    //searches by media. Accepts up to 3 parameters, seperated by / . ie: */media/porcelain/underglaze/glaze
    //see index.js in routes for more details.
    findByMedia: function (req, res) {
        let query = [
            req.params.media,
        ]
        if (req.params.mediatwo) {
            query.push(req.params.mediatwo)
        }
        if (req.params.mediathree) {
            query.push(req.params.mediathree)
        }
        console.log(query)
        db.Arts.find({ media: { $all: [...query] } })
            .sort({ title: +1 })
            .then(art => res.json(art))
            .catch((err) => res.status(422).json(err));
    },
    //Searches by size. Accepts at least 1 parameter, height, and up to 2 additional optional parameters, width and length.
    //much like the previous function, syntax is */size/{height}/{width}/{length}. The route always defines it like this. 
    //a fix will be to let you choose which dimension you are searching for so i will come back to this.
    findBySize: function (req, res) {
        console.log(req.params)
        let query = {}
        for (const param in req.params) {
            if (req.params[param] !== undefined) {
                query[`size.${param}`] = ({ $lte: parseInt(`${req.params[param]}`) })
            }
        }
        db.Arts.find(query)
            .sort({ title: +1 })
            .then(art => res.json(art))
            .catch((err) => res.status(422).json(err));
    },
    //Searches by price.
    findByPrice: function (req, res) {
        db.Arts.find({ price: { $lte: req.params.price } })
            .sort({ price: +1 })
            .then(art => res.json(art))
            .catch((err) => res.status(422).json(err));
    },
    //Searches by piece type is sort of misleading, this function takes in true or false. True = wall piece, False = non wall piece.
    findByPieceType: function (req, res) {
        db.Arts.find({ wallPiece: req.params.type })
            .sort({ title: +1 })
            .then(art => res.json(art))
            .catch((err) => res.status(422).json(err));
    },
    //searches by image url, must be exact, mostly just for testing use right now
    findByImageUrl: function (req, res) {
        db.Arts.find({ imageUrl: req.params.imageUrl })
            .sort({ title: +1 })
            .then(art => res.json(art))
            .catch((err) => res.status(422).json(err));
    },
    //searches by show name, must be exact right now as i could not figure out the regex. I will come back to this.
    findByShow: function (req, res) {
        db.Arts.find({ shows: { $all: req.params.show } })
            .sort({ title: +1 })
            .then(art => res.json(art))
            .catch((err) => res.status(422).json(err));
    },
    sendMessage: async function (req, res) {
        console.log(req.body)
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport(smtpTransport({
            service: 'gmail',
            auth: {
                user: creds.USER, // generated ethereal user
                pass: creds.PASS, // generated ethereal password
            },
        }));

        transporter.verify((error, success) => {
            if (error) {
                console.log(error);
            } else {
                console.log('Server is ready to take messages');
            }
        });

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: `${req.body.name}`, // sender address
            to: "quinn.tcalhoun@gmail.com, sandycalhounart@gmail.com", // list of receivers
            subject: `${req.body.subject}`, // Subject line
            text: `${req.body.name} at ${req.body.email} sent: ${req.body.message}`, // plain text body
        }).then(koosl => res.json(koosl))
        console.log("Message sent: %s", info.messageId);

    }
}

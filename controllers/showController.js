const db = require('../models')

module.exports = {
    getShows: function(req, res) {
        db.Shows.find({})
        .sort({year: -1})
        .then(data => res.json(data))        
        .catch((err) => res.status(422).json(err));
    }
}
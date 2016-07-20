var mongoose = require('mongoose');
var async = require('async');

var db = 'mongodb://localhost/myawesomeapp';

mongoose.connect(db, function (err) {
    if (err) { throw err; }

    async.series([_dropCollection, _renameCollection], function (err, result) {
        if (err) { throw err; }
        console.info('Completed successfully! Result: ' + result);
        process.exit();
    });
});

function _dropCollection(callback) {
    mongoose.connection.db.dropCollection('event', function (err, result) {
        if (err) { callback(err); }
        callback(null, result);
    });
}

function _renameCollection(callback) {
    mongoose.connection.db.renameCollection('eventV2', 'event', function (err, result) {
        if (err) { callback(err); }
        callback(null, result);
    });
}
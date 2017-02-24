// Bring Mongoose into the app
var mongoose = require( 'mongoose' );
mongoose.Promise = global.Promise;

// Build the connection string
//Help Me Choose
var dbURI = 'mongodb://bus119a:adoptapark1@ds048719.mlab.com:48719/adopt-a-park';

// Create the database connection
mongoose.connect(dbURI);
//mongoose.set('debug',true);

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', function () {
    console.log('Mongoose default connection open to ' + dbURI);
});

// If the connection throws an error
mongoose.connection.on('error',function (err) {
    console.log('Mongoose default connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
    console.log('Mongoose default connection disconnected');
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function() {
    mongoose.connection.close(function () {
        console.log('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});

module.exports = mongoose.connection;

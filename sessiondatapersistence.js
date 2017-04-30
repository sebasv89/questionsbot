var restify = require('restify');
var builder = require('botbuilder');
var peoplefinder = require('./peoplefinder');
var sessiondatapersistence = require('./sessiondatapersistence');

// TODO: This is a temporary solution that stores all metadata on session variables. Since this is not scalable (can't support multiple bot processing nodes), this should be changed to using a database.

function alreadyHaveUserData(session, emailAddress){
    if (session.userData.emailAddress === null){
        return false;
    }
}
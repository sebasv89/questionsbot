var restify = require('restify');
var builder = require('botbuilder');

// Get secrets from server environment
var botConnectorOptions = { 
    appId: process.env.BOTFRAMEWORK_APPID, 
    appPassword: process.env.BOTFRAMEWORK_APPSECRET
};

// Create bot
var connector = new builder.ChatConnector(botConnectorOptions);
var bot = new builder.UniversalBot(connector);


// Create LUIS recognizer that points at our model and add it as the root '/' dialog for our Cortana Bot.
var model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/a90971ea-8f13-44a6-b668-4eae2a143fe1?subscription-key=68603617abd246748298dd82c031dde2&timezoneOffset=0&verbose=true&q=';
var recognizer = new builder.LuisRecognizer(model);
var dialog = new builder.IntentDialog({ recognizers: [recognizer] });
bot.dialog('/', dialog);

dialog.matches("AskQuestionWithSkillActivity", [
    function (session, args, next) {
        var questionTopic = builder.EntityRecognizer.findEntity(args.entities, 'QuestionTopic');
        session.send('You are asking a question about %s!', questionTopic.entity);
        session.endDialog();
    }
]);

dialog.matches("None", [
    function (session, args, next) {
        session.send("I don't know what you meant.");
        session.endDialog();
    }
]);

// Setup Restify Server
var server = restify.createServer();

// Handle Bot Framework messages
server.post('/api/messages', connector.listen());

// Serve a static web page
server.get(/.*/, restify.serveStatic({
	'directory': '.',
	'default': 'index.html'
}));

server.listen(process.env.port || 3978, function () {
    console.log('%s listening to %s', server.name, server.url); 
});

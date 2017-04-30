var restify = require('restify');
var builder = require('botbuilder');
var peoplefinder = require('./peoplefinder');

function loadDialogsForBot(bot) {

    bot.dialog('/', buildNLPDialog());
    bot.dialog('/askUserBasicData', buildAskUserBasicDataDialog());


}

function buildNLPDialog() {
    var model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/a90971ea-8f13-44a6-b668-4eae2a143fe1?subscription-key=68603617abd246748298dd82c031dde2&timezoneOffset=0&verbose=true&q=';
    var recognizer = new builder.LuisRecognizer(model);
    var dialog = new builder.IntentDialog({ recognizers: [recognizer] });
    dialog.matches("AskQuestionWithSkillActivity", [
        function (session, args, next) {
            if (session.userData.emailAddress == undefined || session.userData.emailAddress === null){
                session.beginDialog('/askUserBasicData');
                return;
            }    
            var questionTopic = builder.EntityRecognizer.findEntity(args.entities, 'QuestionTopic');
            session.send('Thanks ' + session.userData.emailAddress + '!, You are asking a question about %s!', questionTopic.entity);
            var numberOfPeopleWithSkill = peoplefinder.findPeopleForSkill(questionTopic.entity);
            session.send('There are %d people who know %s. I am asking them your question.', numberOfPeopleWithSkill, questionTopic.entity);

            session.send("args= " + args + ", address=" + JSON.stringify(session.message.address));
            session.endDialog();
        }
    ]);

    dialog.matches("None", [
        function (session, args, next) {
    
            if (session.userData.emailAddress == undefined || session.userData.emailAddress === null){
                session.beginDialog('/askUserBasicData');
            }    
            session.send("I don't know what you meant.");
            session.endDialog();
        }
    ]);

    return dialog;
}

function buildAskUserBasicDataDialog() {
    return [
        function (session) {
            builder.Prompts.text(session, 'Before we can talk, what is your email address?');
        },
        function (session, results) {
            session.userData.emailAddress = results.response;
            session.endDialog("Thanks! now you can start asking questions");
        }
    ];
}






exports.loadDialogsForBot = loadDialogsForBot;
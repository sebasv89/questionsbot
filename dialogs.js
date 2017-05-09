var restify = require('restify');
var builder = require('botbuilder');
var peopleskillsfinder = require('./peopleskillsfinder');
var botpersistence = require('./botpersistence');
var questionmanager = require('./questionmanager');

function loadDialogsForBot(bot) {
    bot.dialog('/', buildLUISDialog(bot));
    bot.dialog('/askUserBasicData', buildAskUserBasicDataDialog(bot));
    bot.dialog('/askQuestionToExpert', buildAskQuestionToExpertDialog(bot));
    bot.dialog('/gotAnAnswer', buildGotAnAnswerDialog(bot));
    bot.dialog('/tryAgain', buildTryAgainDialog(bot));
    
}

function buildLUISDialog(bot) {
    var model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/a90971ea-8f13-44a6-b668-4eae2a143fe1?subscription-key=68603617abd246748298dd82c031dde2&timezoneOffset=0&verbose=true&q=';
    var recognizer = new builder.LuisRecognizer(model);
    var dialog = new builder.IntentDialog({ recognizers: [recognizer] });
    dialog.matches("AskQuestionWithSkillActivity", [
        function (session, args, next) {
            
            performInitialDialogActions(session);

            var questionTopic = builder.EntityRecognizer.findEntity(args.entities, 'QuestionTopic');

            if (questionTopic === null || questionTopic.entity === null){
                session.replaceDialog("/tryAgain");
                return;
            }

            var peopleWithSkill = peopleskillsfinder.findPeopleWithSkill(questionTopic.entity);
            
            // TODO - this should be dialogData but it seems there is a bug
            session.userData.questionTopic = questionTopic.entity;
            session.userData.peopleWithSkill = peopleWithSkill;

            if (peopleWithSkill.length == 0){
                // TODO - no hay nadie que sepa. debe hacer otra pregunta.
                session.send("There is nobody who knows this. Please try with other keyword");
                session.endDialog();
            } else {
                if (peopleWithSkill.length == 1){
                    builder.Prompts.text(session, 'There is 1 person who know ' + questionTopic.entity + '. What is your question?');
                } else {
                    builder.Prompts.text(session, 'There are ' + peopleWithSkill.length + ' people who know ' + questionTopic.entity + '. What is your question?');
                }
            }
        },
        function (session, args, next) {
            session.send("OK. I'm sending your question right now... Please wait for some moments, I will let you know once I get some answers...");
            questionmanager.askAndAnswerQuestion(bot, session.userData.emailAddress, session.message.text,session.userData.questionTopic, session.userData.peopleWithSkill);
            session.endDialog();
        }
    ]);

    dialog.matches("None", "/tryAgain");
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

function buildAskQuestionToExpertDialog(bot) {
    return [
        function (session, args) {
            session.userData.questionToSolve = args.question;
            session.userData.topic = args.topic;
            session.userData.originEmailAddress = args.originEmailAddress;

            session.send("Hey! " + args.originEmailAddress + " has a question about " + args.topic + " and we think you can help him.");
            builder.Prompts.confirm(session, 'Do you have one min?');
            
        },
        function (session, results) {
            if (results.response === true){
                session.send("Great! This is the question: " + session.userData.questionToSolve);
                builder.Prompts.text(session, 'If you wanna answer, go ahead. just write it down and I will pass it. You can also tell me "I wanna talk" and I will pass the information to the guy');
            } else {
                session.endDialog("Not a problem. Thanks!");
            }
        },
        function (session, results){
            if (results.response === "I wanna talk"){
                session.endDialog("Ok. I will let him know to look for you. Thanks!");
            } else {
                var answer = results.response;
                session.endDialog("Thanks for answering! I will send the info right now. See you!");
                questionmanager.sendAnswer(answer, session.userData.originEmailAddress, session.userData.emailAddress, bot);
            }
        }
    ];
}

function buildGotAnAnswerDialog() {
    return [
        function (session, args) {
            session.send("Got an answer from " + args.responseEmailAddress + "!");
            session.send("This is it: " + args.answer);
            session.endDialog("I would let you know if more people answer!");
        }
        
    ];
}

function buildTryAgainDialog(){
    return [
        function (session, args, next) {
    
            if (session.userData.emailAddress == undefined || session.userData.emailAddress === null){
                session.beginDialog('/askUserBasicData');
            }
            session.send("I don't know what you meant.");
            session.endDialog();
        }
    ];
}

function performInitialDialogActions(session){
    if (session.userData.emailAddress == undefined || session.userData.emailAddress === null){
                session.beginDialog('/askUserBasicData');
                return;
    }
    botpersistence.updateUserAddress(session);
}

exports.loadDialogsForBot = loadDialogsForBot;
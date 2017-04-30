var botpersistence = require('./botpersistence');

// TODO - REFACTOR THIS CODE. I THINK IS USELESS

function askAndAnswerQuestion(bot, originEmailAddress, question, topic, peopleWithSkill){
    peopleWithSkill.forEach(function(personToAsk) {
        var params = [];
        params.bot = bot;
        params.originEmailAddress = originEmailAddress;
        params.question = question;
        params.topic = topic;

        botpersistence.getAddressForUserId(personToAsk.userId, askTheQuestion, params);
        
        
    });
}

function askTheQuestion(addressString, params){
    var address = JSON.parse(addressString);
    params.bot.beginDialog(address, '/askQuestionToExpert', { question: params.question, topic: params.topic, originEmailAddress : params.originEmailAddress });
}

exports.askAndAnswerQuestion = askAndAnswerQuestion;
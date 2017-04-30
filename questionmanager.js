var botpersistence = require('./botpersistence');

// TODO - REFACTOR THIS CODE. I THINK IS USELESS

function askAndAnswerQuestion(bot, originEmailAddress, question, topic, peopleWithSkill) {
    peopleWithSkill.forEach(function (personToAsk) {
        var params = [];
        params.bot = bot;
        params.originEmailAddress = originEmailAddress;
        params.question = question;
        params.topic = topic;

        botpersistence.getAddressForUserId(personToAsk.userId, params, function (addressString, params) {
            var address = JSON.parse(addressString);
            params.bot.beginDialog(address, '/askQuestionToExpert', { question: params.question, topic: params.topic, originEmailAddress: params.originEmailAddress, bot: params.bot });
        });


    });
}

function sendAnswer(answer, originEmailAddress, responseEmailAddress, bot) {
    var params = [];
    params.bot = bot;
    params.originEmailAddress = originEmailAddress;
    params.responseEmailAddress = responseEmailAddress;
    params.answer = answer;
    botpersistence.getAddressForUserId(originEmailAddress, params, function (addressString, params) {
        var address = JSON.parse(addressString);
        bot.beginDialog(address, '/gotAnAnswer', { answer: params.answer, responseEmailAddress: params.responseEmailAddress, bot: params.bot });
    });
}

exports.askAndAnswerQuestion = askAndAnswerQuestion;
exports.sendAnswer = sendAnswer;
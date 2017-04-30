
var fs = require("fs");
var peopleSkills = JSON.parse(fs.readFileSync("skills.js"));

function findPeopleForSkill(skillToSearch) {
    var count = 0;
    peopleSkills.forEach(function(personSkills) {
        if (personSkills.hasOwnProperty(skillToSearch) && personSkills[skillToSearch] === 1){
            count++;
        }
    });
    return count;
}
exports.findPeopleForSkill = findPeopleForSkill;
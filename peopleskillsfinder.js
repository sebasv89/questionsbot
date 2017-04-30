
var fs = require("fs");
var peopleSkills = JSON.parse(fs.readFileSync("skills.js"));

function findPeopleWithSkill(skillToSearch) {
    var peopleWithSkill = [];
    peopleSkills.forEach(function(person) {
        if (person.hasOwnProperty(skillToSearch) && person[skillToSearch] === 1){
            peopleWithSkill.push(person);
        }
    });
    return peopleWithSkill;
}
exports.findPeopleWithSkill = findPeopleWithSkill;
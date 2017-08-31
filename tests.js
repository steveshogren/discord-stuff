const helpers = require("./helpers.js");

const runTests = function() {
    var results = "";
    const assertEqual = function(x, y) {
        if(x === y) {
            results +=".";
        } else {
            results += ("\nFailed. " + x + " does not equal " + y + "\n");
        }
    };

    const players = [
        { elo:10, heroDamage:1, minionDamage:1, jungleDamage:1, towerDamage:1 },
        { elo:20, heroDamage:0, minionDamage:0, jungleDamage:0, towerDamage:0 },
        { elo:30, heroDamage:3, minionDamage:3, jungleDamage:3, towerDamage:3 },
        { elo:40, heroDamage:2, minionDamage:2, jungleDamage:2, towerDamage:2 },
        { elo:0, heroDamage:4, minionDamage:4, jungleDamage:4, towerDamage:4 }
    ];
    const expectedSum = {
        heroDamage:10,
        minionDamage:10,
        jungleDamage:10,
        towerDamage:10
    };

    assertEqual(JSON.stringify(expectedSum, null, '\t'), JSON.stringify(helpers.getTeamDamage(players),null,'\t'));
    assertEqual(20, helpers.getTeamElo(players));

    console.log(results);
};

runTests();

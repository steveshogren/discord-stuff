const http = require('https');
const storage = require('node-persist');

const ex = module.exports;

const milliTimeLeft = function(totalSeconds, remainingSeconds) {
    var totalMilli = totalSeconds * 1000;
    var remainingMilli = remainingSeconds * 1000;
    return (totalMilli - remainingMilli);
};

ex.banMessage = " seconds left";

ex.makeBanTimer = function(message, totalSeconds, remainingSeconds) {
    setTimeout(function() {
        message.channel.send(remainingSeconds + ex.banMessage);
    }, milliTimeLeft(totalSeconds, remainingSeconds));
};

ex.getGame = function (gameId, callback) {
    return http.get("https://api.agora.gg/v1/games/" + gameId + "?lc=en", function(response) {
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {
            var parsed = JSON.parse(body);
            callback(parsed);
        });
    });
};

const addPlayerDamage = function(p, teamDamage) {
    teamDamage.heroDamage += p.heroDamage;
    teamDamage.minionDamage += p.minionDamage;
    teamDamage.jungleDamage += p.jungleDamage;
    teamDamage.towerDamage += p.towerDamage;
    return teamDamage;
};

ex.getTeamDamage = function(team) {
    var initialTeamSum = { heroDamage: 0, minionDamage: 0, jungleDamage: 0, towerDamage: 0 };
    return [0,1,2,3,4].reduce(function(ret, p) {
        return addPlayerDamage(team[p], ret);
    }, initialTeamSum);
};

ex.getTeamElo = function(team) {
    return [0,1,2,3,4].reduce(function(ret, p) {
        return team[p].elo + ret;
    }, 0)/5;
};


ex.csvTeam = function(team) {
    const tDamage = ex.getTeamDamage(team);
    const playerCsv = function(p, teamDamage) {
        return "," + p.name
            + "," + p.elo
            + "," + p.hero;
    };

    return "," + ex.getTeamElo(team)
        + "," + tDamage.heroDamage
        + "," + tDamage.minionDamage
        + "," + tDamage.jungleDamage
        + "," + tDamage.towerDamage
        + playerCsv(team[0])
        + playerCsv(team[1])
        + playerCsv(team[2])
        + playerCsv(team[3])
        + playerCsv(team[4]);
};

ex.parseGame = function(d) {
    const game =
              '=SPLIT("'
              + (Math.floor(d.length/60) + " minutes")
              + "," + (d.winningTeam == 0 ? "Team One Won" : "Team Two Won")
              + ex.csvTeam(d.teams[0])
              + ex.csvTeam(d.teams[1])
              + '", ",")';
    console.log(game);
    return game;
};

ex.playerElo = function(message, agoraId) {
    http.get("https://api.agora.gg/v1/players/" + agoraId + "", function(response) {
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {
            var parsed = JSON.parse(body);
            var s = parsed.stats[0];
            var elo = parsed.name +  " Elo: " + Math.floor(s.elo) + ", Top " + Math.floor(s.percentile) + "%, Won " + s.wins + "/" + s.gamesPlayed + " (" + Math.floor((s.wins/s.gamesPlayed)*100) +  "%)";
            console.log(elo);
            message.reply(elo);
        });
    });
};

ex.addPlayer = function(message, discordId, agoraUrl) {
    var agoraId = agoraUrl.substring(25).replace(/\/.*/, "");
    storage.initSync();
    storage.setItemSync(discordId, agoraId);
    ex.playerElo(message, agoraId);
};

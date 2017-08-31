const http = require('https');

const banMessage = " seconds left";

const ex = module.exports;

const milliTimeLeft = function(totalSeconds, remainingSeconds) {
    var totalMilli = totalSeconds * 1000;
    var remainingMilli = remainingSeconds * 1000;
    return (totalMilli - remainingMilli);
};

ex.makeBanTimer = function(message, totalSeconds, remainingSeconds) {
    setTimeout(function() {
        message.channel.send(remainingSeconds + banMessage);
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

ex.addPlayer = function(p, teamDamage) {
    return "," + p.name
        + "," + p.elo
        + "," + p.hero;
    // + "," + p.level + "," + p.kills + "," + p.deaths + "," + p.assists + "," + p.towers + "," + p.heroDamage + "," + p.minionDamage + "," + p.jungleDamage + "," + p.towerDamage + "," + p.heroGamesPlayed + "," + p.heroWins + "," + p.heroKills + "," + p.heroDeaths + "," + p.heroAssists + "," + p.totalGamesPlayed + "," + p.totalWins + "," + p.totalKills + "," + p.totalDeaths + "," + p.totalAssists + "," + p.totalTowers;
};

ex.csvTeam = function(team) {
    const tDamage = helpers.getTeamDamage(team);

    return "," + helpers.getTeamElo(team)
        + "," + tDamage.heroDamage
        + "," + tDamage.minionDamage
        + "," + tDamage.jungleDamage
        + "," + tDamage.towerDamage
        + addPlayer(team[0])
        + addPlayer(team[1])
        + addPlayer(team[2])
        + addPlayer(team[3])
        + addPlayer(team[4]);
};

ex.parseGame = function(d) {
    const game =
              '=SPLIT("'
              + (Math.floor(d.length/60) + " minutes")
              + "," + (d.winningTeam == 0 ? "Team One Won" : "Team Two Won")
              + csvTeam(d.teams[0])
              + csvTeam(d.teams[1])
              + '", ",")';
    console.log(game);
    return game;
};

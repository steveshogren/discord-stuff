const http = require('https');
const Discord = require('discord.js');
const client = new Discord.Client();

const config = require('config');
const token = config.get('token');

const banMessage = " seconds left";

client.on('ready', () => {
    console.log('I am ready!');
});

const milliTimeLeft = function(totalSeconds, remainingSeconds) {
    var totalMilli = totalSeconds * 1000;
    var remainingMilli = remainingSeconds * 1000;
    return (totalMilli - remainingMilli);
};

const makeBanTimer = function(message, totalSeconds, remainingSeconds) {
    setTimeout(function() {
        message.channel.send(remainingSeconds + banMessage);
    }, milliTimeLeft(totalSeconds, remainingSeconds));
};
const getGame = function getGame(gameId, callback) {
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

client.on('message', message => {
    if (message.content === 'ping') {
        message.reply('pong');
    }
    if (message.content.includes('custom.bot.csv')) {
        var gameid = message.content.substring(14).trim();
        getGame(gameid, function(d) {
            //console.log(d);
            const game = parseGame(d);
            message.reply(game);
        });
    }
    if (message.content === 'custom timer') {
        message.channel.send('120' + banMessage);
        makeBanTimer(message, 120, 90);
        makeBanTimer(message, 120, 60);
        makeBanTimer(message, 120, 30);
        makeBanTimer(message, 120, 15);
        makeBanTimer(message, 120, 10);
        makeBanTimer(message, 120, 5);
        setTimeout(function() {
            message.channel.send('WHERES YOUR BAN?');
        }, 1000 * 120);
    }


});


const addPlayer = function(p, teamDamage) {
    return "," + p.name
        + "," + p.elo
        + "," + p.hero;
    // + "," + p.level + "," + p.kills + "," + p.deaths + "," + p.assists + "," + p.towers + "," + p.heroDamage + "," + p.minionDamage + "," + p.jungleDamage + "," + p.towerDamage + "," + p.heroGamesPlayed + "," + p.heroWins + "," + p.heroKills + "," + p.heroDeaths + "," + p.heroAssists + "," + p.totalGamesPlayed + "," + p.totalWins + "," + p.totalKills + "," + p.totalDeaths + "," + p.totalAssists + "," + p.totalTowers;
};

const map = function(f, coll) {
    var ret = [];
    for(var i = 0; i < coll.length; i++){
        ret = ret.concat([f(coll[i])]);
    }
    return ret;
};

const reduce = function(f, seed, coll) {
    var next = seed;
    for(var i = 0; i < coll.length; i++){
        next = f(coll[i], next);
    }
    return next;
};

const addPlayerDamage = function(p, teamDamage) {
    teamDamage.heroDamage += p.heroDamage;
    teamDamage.minionDamage += p.minionDamage;
    teamDamage.jungleDamage += p.jungleDamage;
    teamDamage.towerDamage += p.towerDamage;
    return teamDamage;
};

const getTeamDamage = function(team) {
    var initialTeamSum = { heroDamage: 0, minionDamage: 0, jungleDamage: 0, towerDamage: 0 };
    return reduce(function(p, ret) {
        return addPlayerDamage(team[p], ret);
    }, initialTeamSum, [0,1,2,3,4]);
};

const getTeamElo = function(team) {
    return reduce(function(p, ret) {
        return team[p].elo + ret;
    }, 0, [0,1,2,3,4])/5;
};

const csvTeam = function(team) {
    const tDamage = getTeamDamage(team);

    return "," + getTeamElo(team)
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

const parseGame = function(d) {
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


const runTests = function() {
    var results = "";
    const assertEqual = function(x, y) {
        if(x === y) {
            results +=".";
        } else {
            results += ("\nFailed. " + x + " does not equal " + y + "\n");
        }
    };

    assertEqual(6,reduce(function(x,n) {return x + n;}, 0, [0,1,2,3]));
    assertEqual(0,reduce(function(x,n) {return x + n;}, 0, []));
    assertEqual(0,reduce(function(x,n) {return x + n;}, 0, [0]));

    assertEqual([1,2,3].toString(),map(function(x) {return x + 1;}, [0,1,2]).toString());
    assertEqual([].toString(),map(function(x) {return x + 1;}, []).toString());

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

    assertEqual(JSON.stringify(expectedSum, null, '\t'), JSON.stringify(getTeamDamage(players),null,'\t'));
    assertEqual(20, getTeamElo(players));

    console.log(results);
};

//getGame("9d7403ba86d44193b6773847bb6e1bb9", function(d) {
//    parseGame(d);
//});

//runTests();
client.login(token);

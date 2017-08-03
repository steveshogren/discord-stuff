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
    totalMilli = totalSeconds * 1000;
    remainingMilli = remainingSeconds * 1000;
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
    // + "," + p.level
    // + "," + p.kills
    // + "," + p.deaths
    // + "," + p.assists
    // + "," + p.towers
    // + "," + p.heroDamage
    // + "," + p.minionDamage
    // + "," + p.jungleDamage
    // + "," + p.towerDamage
    // + "," + p.heroGamesPlayed
    // + "," + p.heroWins
    // + "," + p.heroKills
    // + "," + p.heroDeaths
    // + "," + p.heroAssists
    // + "," + p.totalGamesPlayed
    // + "," + p.totalWins
    // + "," + p.totalKills
    // + "," + p.totalDeaths
    // + "," + p.totalAssists
    //    + "," + p.totalTowers;
};

const addPlayerDamage = function(p, teamDamage) {
    teamDamage.heroDamage   = teamDamage.heroDamage    ? teamDamage.heroDamage : 0;
    teamDamage.minionDamage = teamDamage.minionDamage  ? teamDamage.minionDamage : 0;
    teamDamage.jungleDamage = teamDamage.jungleDamage  ? teamDamage.jungleDamage : 0;
    teamDamage.towerDamage  = teamDamage.towerDamage   ? teamDamage.towerDamage : 0;
    teamDamage.heroDamage += p.heroDamage;
    teamDamage.minionDamage += p.minionDamage;
    teamDamage.jungleDamage+= p.jungleDamage;
    teamDamage.towerDamage+= p.towerDamage;
    return teamDamage;
};

const parseGame = function(d) {
    const t0Damage =
              addPlayerDamage(d.teams[0][4],
              addPlayerDamage(d.teams[0][3],
              addPlayerDamage(d.teams[0][2],
              addPlayerDamage(d.teams[0][1],
                              addPlayerDamage(d.teams[0][0], {})))));

    const t1Damage =
              addPlayerDamage(d.teams[1][4],
                              addPlayerDamage(d.teams[1][3],
                                              addPlayerDamage(d.teams[1][2],
                                                              addPlayerDamage(d.teams[1][1],
                                                                              addPlayerDamage(d.teams[1][0], {})))));


    const t0Elo = (d.teams[0][4].elo
                   + d.teams[0][3].elo
                   + d.teams[0][2].elo
                   + d.teams[0][1].elo
                   + d.teams[0][0].elo
                  )/5;
    const t1Elo = (d.teams[1][4].elo
                   + d.teams[1][3].elo
                   + d.teams[1][2].elo
                   + d.teams[1][1].elo
                   + d.teams[1][0].elo
                  )/5;
    const game =
              "=SPLIT(\""
              + (Math.floor(d.length/60) + " minutes")
              + "," + (d.winningTeam == 0 ? "Team One Won" : "Team Two Won")
              + "," + t0Elo
              + "," + t0Damage.heroDamage
              + "," + t0Damage.minionDamage
              + "," + t0Damage.jungleDamage
              + "," + t0Damage.towerDamage
              + addPlayer(d.teams[0][0])
              + addPlayer(d.teams[0][1])
              + addPlayer(d.teams[0][2])
              + addPlayer(d.teams[0][3])
              + addPlayer(d.teams[0][4])
              + "," + t1Elo
              + "," + t1Damage.heroDamage
              + "," + t1Damage.minionDamage
              + "," + t1Damage.jungleDamage
              + "," + t1Damage.towerDamage
              + addPlayer(d.teams[1][0])
              + addPlayer(d.teams[1][1])
              + addPlayer(d.teams[1][2])
              + addPlayer(d.teams[1][3])
              + addPlayer(d.teams[1][4]) + "\", \",\")";
    console.log(game);
    return game;
};

//getGame("9d7403ba86d44193b6773847bb6e1bb9", function(d) {
//    parseGame(d);
//});


client.login(token);

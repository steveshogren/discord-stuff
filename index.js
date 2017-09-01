const helpers = require('./helpers.js');

const Discord = require('discord.js');
const client = new Discord.Client();
const storage = require('node-persist');

const config = require('config');
const token = config.get('token');


const accoutMissingMessage = "Please setup your account with your profile URL like this: \nagora.add https://agora.gg/profile/3035800/madklowns";

client.on('ready', () => {
    console.log('I am ready!');
});


client.on('message', message => {
    if (message.content === 'ping') {
        message.reply('pong');
    }

    if (message.content.startsWith('agora.elo')) {

        storage.initSync();
        var agoraId = storage.getItemSync(message.author.id);
        if(agoraId) {
            helpers.playerElo(message, agoraId);
        } else {
            message.reply(accoutMissingMessage);
        }
    }

    if (message.content.startsWith('agora.add')) {
        const url = message.content.substring(9).trim();
        if (url.startsWith('https:')) {
            helpers.addPlayer(message, message.author.id, message.content.substring(9).trim());
        } else {
            message.reply(accoutMissingMessage);
        }
    }

    if (message.content.includes('custom.bot.csv')) {
        var gameid = message.content.substring(14).trim();
        helpers.getGame(gameid, function(d) {
            //console.log(d);
            const game = helpers.parseGame(d);
            message.reply(game);
        });
    }
    if (message.content === 'custom timer') {
        message.channel.send('120' + helpers.banMessage);
        helpers.makeBanTimer(message, 120, 90);
        helpers.makeBanTimer(message, 120, 60);
        helpers.makeBanTimer(message, 120, 30);
        helpers.makeBanTimer(message, 120, 15);
        helpers.makeBanTimer(message, 120, 10);
        helpers.makeBanTimer(message, 120, 5);
        setTimeout(function() {
            message.channel.send('WHERES YOUR BAN?');
        }, 1000 * 120);
    }
});


//helpers.getGame("9d7403ba86d44193b6773847bb6e1bb9", function(d) {
//    helpers.parseGame(d);
//});
//storage.initSync();
//helpers.playerElo({reply : function(m) {console.log(m);}}, storage.getItemSync("5"));
//helpers.addPlayer({reply : function(m) {console.log(m);}}, "5", "https://agora.gg/profile/3035800/madklowns");
//console.log("agoraId: " + storage.getItemSync("5"));

//runTests();
client.login(token);

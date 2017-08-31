const helpers = require('./helpers.js');

const Discord = require('discord.js');
const client = new Discord.Client();

const config = require('config');
const token = config.get('token');


client.on('ready', () => {
    console.log('I am ready!');
});


client.on('message', message => {
    if (message.content === 'ping') {
        message.reply('pong');
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


helpers.getGame("9d7403ba86d44193b6773847bb6e1bb9", function(d) {
    helpers.parseGame(d);
});

//runTests();
//client.login(token);

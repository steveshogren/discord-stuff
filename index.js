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

client.on('message', message => {
  if (message.content === 'ping') {
    message.reply('pong');
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


client.login(token);

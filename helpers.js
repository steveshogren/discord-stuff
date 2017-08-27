const banMessage = " seconds left";

module.exports.map = function(f, coll) {
    var ret = [];
    for(var i = 0; i < coll.length; i++){
        ret = ret.concat([f(coll[i])]);
    }
    return ret;
};

module.exports.reduce = function(f, seed, coll) {
    var next = seed;
    for(var i = 0; i < coll.length; i++){
        next = f(coll[i], next);
    }
    return next;
};

module.exports.milliTimeLeft = function(totalSeconds, remainingSeconds) {
    var totalMilli = totalSeconds * 1000;
    var remainingMilli = remainingSeconds * 1000;
    return (totalMilli - remainingMilli);
},

module.exports.makeBanTimer= function(message, totalSeconds, remainingSeconds) {
    setTimeout(function() {
        message.channel.send(remainingSeconds + banMessage);
    }, module.exports.milliTimeLeft(totalSeconds, remainingSeconds));
};

module.exports.addPlayerDamage = function(p, teamDamage) {
    teamDamage.heroDamage += p.heroDamage;
    teamDamage.minionDamage += p.minionDamage;
    teamDamage.jungleDamage += p.jungleDamage;
    teamDamage.towerDamage += p.towerDamage;
    return teamDamage;
};

module.exports.getTeamDamage = function(team) {
    var initialTeamSum = { heroDamage: 0, minionDamage: 0, jungleDamage: 0, towerDamage: 0 };
    return module.exports.reduce(function(p, ret) {
        return module.exports.addPlayerDamage(team[p], ret);
    }, initialTeamSum, [0,1,2,3,4]);
};

module.exports.getTeamElo = function(team) {
    return module.exports.reduce(function(p, ret) {
        return team[p].elo + ret;
    }, 0, [0,1,2,3,4])/5;
};

const { getBufferFromUrl } = require("../helpers/utils");
const canvacord = require("canvacord");
const Levels = require("discord-xp");
const config = require('../config.json');
const logger = require('./logger');

const card = async (user) => {
  try {
    logger.debug('LevelCard', `Generating card for user`, { user: user.username });
    
    const levelUser = await Levels.fetch(user.id, config.serverInfo.GUILD_ID);
    const leaderboard = await Levels.fetchLeaderboard(config.serverInfo.GUILD_ID, 30);
    const userRank =
      leaderboard.findIndex(
        (leaderboardUser) => leaderboardUser.userID == user.id
      ) + 1;
    const requiredXp = Levels.xpFor(levelUser.level + 1);
    const img = user.displayAvatarURL({ dynamic: false, format: "png" });
    
    const rank = new canvacord.Rank()
      .setAvatar(img)
      .setCurrentXP(levelUser.xp, "#FFFFFF")
      .setRequiredXP(requiredXp, "#FFC000")
      .setRank(userRank, "RANK #")
      .setRankColor("#FFFFFF", "#FFC000")
      .setOverlay("#0f0f0f", "0.7")
      .setProgressBar("#FFC000")
      .setUsername(user.username)
      .setLevel(levelUser.level)
      .setLevelColor("#FFFFFF", "#FFC000");
    
    logger.debug('LevelCard', `Card generated`, { user: user.username, rank: userRank, level: levelUser.level, xp: levelUser.xp });
    return rank;
  } catch (err) {
    logger.error('LevelCard', `Failed to generate card`, { user: user.username, error: err.message });
    throw err;
  }
};

module.exports = card;

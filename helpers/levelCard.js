const { getBufferFromUrl } = require("../helpers/utils");
const canvacord = require("canvacord");
const Levels = require("discord-xp");
const config = require('../config.json');

const card = async (user) => {
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
    .setLevelColor("#FFFFFF", "#FFC000")
  return rank;
};

module.exports = card;
